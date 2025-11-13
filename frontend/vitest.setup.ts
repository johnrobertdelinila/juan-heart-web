/**
 * Vitest Setup File
 *
 * Global test setup and configuration for unit tests.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://127.0.0.1:8000/api/v1';

// Suppress console errors in tests (optional - remove if you want to see them)
// global.console.error = vi.fn();
// global.console.warn = vi.fn();
