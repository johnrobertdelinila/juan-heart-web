/**
 * Tests for API Error Handler
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleApiRequest,
  parseApiResponse,
  ApiError,
  logApiError,
} from '../api-error-handler';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseApiResponse', () => {
    it('should parse valid JSON response', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response;

      const result = await parseApiResponse(mockResponse);
      expect(result).toEqual(mockData);
    });

    it('should throw ApiError for HTML response', async () => {
      const htmlResponse = '<!DOCTYPE html><html><body>Error</body></html>';
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/html' }),
        text: vi.fn().mockResolvedValue(htmlResponse),
      } as unknown as Response;

      await expect(parseApiResponse(mockResponse)).rejects.toThrow(ApiError);
    });

    it('should handle JSON parse errors gracefully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Response;

      await expect(parseApiResponse(mockResponse)).rejects.toThrow(ApiError);
    });
  });

  describe('handleApiRequest', () => {
    it('should return parsed data for successful JSON response', async () => {
      const mockData = { success: true, data: { id: 1 } };
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response;

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await handleApiRequest('http://test.com/api', {});
      expect(result).toEqual(mockData);
    });

    it('should throw ApiError with user-friendly message for 429 status', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'content-type': 'text/html' }),
        text: vi.fn().mockResolvedValue('<!DOCTYPE html>Rate limit exceeded'),
      } as unknown as Response;

      (global.fetch as any).mockResolvedValue(mockResponse);

      try {
        await handleApiRequest('http://test.com/api', {});
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe(
          'Too many requests: Please wait a moment and try again'
        );
        expect((error as ApiError).status).toBe(429);
      }
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValue(new TypeError('Failed to fetch'));

      try {
        await handleApiRequest('http://test.com/api', {});
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toContain('Network error');
      }
    });

    it('should throw ApiError for 500 server error with HTML response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'text/html' }),
        text: vi.fn().mockResolvedValue('<!DOCTYPE html>Server error'),
      } as unknown as Response;

      (global.fetch as any).mockResolvedValue(mockResponse);

      try {
        await handleApiRequest('http://test.com/api', {});
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe(
          'Server error: Something went wrong on our end'
        );
        expect((error as ApiError).status).toBe(500);
      }
    });

    it('should handle JSON error responses from API', async () => {
      const errorData = { message: 'Custom error message', code: 'ERR_001' };
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue(errorData),
      } as unknown as Response;

      (global.fetch as any).mockResolvedValue(mockResponse);

      try {
        await handleApiRequest('http://test.com/api', {});
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('Custom error message');
        expect((error as ApiError).status).toBe(400);
      }
    });
  });

  describe('ApiError class', () => {
    it('should create error with all properties', () => {
      const error = new ApiError({
        message: 'Test error',
        status: 404,
        statusText: 'Not Found',
        details: 'Resource not found',
      });

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
      expect(error.details).toBe('Resource not found');
      expect(error.name).toBe('ApiError');
    });
  });

  describe('logApiError', () => {
    it('should not throw when called', () => {
      const error = new ApiError({
        message: 'Test error',
        status: 500,
      });

      expect(() => logApiError(error, 'testContext')).not.toThrow();
    });
  });
});
