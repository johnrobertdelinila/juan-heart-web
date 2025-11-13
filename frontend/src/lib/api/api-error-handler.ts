/**
 * Centralized API Error Handler for Juan Heart Web Application
 *
 * Handles non-JSON responses, network errors, and provides user-friendly error messages
 */

export interface ApiErrorResponse {
  message: string;
  status?: number;
  statusText?: string;
  details?: string;
}

export class ApiError extends Error {
  status?: number;
  statusText?: string;
  details?: string;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = 'ApiError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.details = response.details;
  }
}

/**
 * Safely parse API response, handling both JSON and non-JSON responses
 */
export async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  // Check if response is JSON
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      // JSON parse error
      throw new ApiError({
        message: 'Invalid JSON response from server',
        status: response.status,
        statusText: response.statusText,
        details: error instanceof Error ? error.message : 'Unknown JSON parse error',
      });
    }
  } else {
    // Non-JSON response (HTML error pages, plain text, etc.)
    const text = await response.text();
    const preview = text.substring(0, 200);

    throw new ApiError({
      message: getUserFriendlyErrorMessage(response.status, response.statusText),
      status: response.status,
      statusText: response.statusText,
      details: `Server returned ${contentType || 'unknown'} instead of JSON. Response preview: ${preview}`,
    });
  }
}

/**
 * Handle API fetch with proper error handling
 */
export async function handleApiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    // Handle successful responses
    if (response.ok) {
      return await parseApiResponse<T>(response);
    }

    // Handle error responses
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      // API returned JSON error
      try {
        const errorData = await response.json();
        throw new ApiError({
          message: errorData.message || getUserFriendlyErrorMessage(response.status, response.statusText),
          status: response.status,
          statusText: response.statusText,
          details: JSON.stringify(errorData),
        });
      } catch (error) {
        if (error instanceof ApiError) throw error;

        // Failed to parse JSON error
        throw new ApiError({
          message: getUserFriendlyErrorMessage(response.status, response.statusText),
          status: response.status,
          statusText: response.statusText,
        });
      }
    } else {
      // Non-JSON error response (HTML error pages, etc.)
      const text = await response.text();
      const preview = text.substring(0, 200);

      throw new ApiError({
        message: getUserFriendlyErrorMessage(response.status, response.statusText),
        status: response.status,
        statusText: response.statusText,
        details: `Server returned ${contentType || 'unknown'} response. Preview: ${preview}`,
      });
    }
  } catch (error) {
    // Network errors, fetch failures, etc.
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError({
        message: 'Network error: Unable to connect to the server. Please check your internet connection.',
        details: error.message,
      });
    }

    // Unknown errors
    throw new ApiError({
      message: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Get user-friendly error message based on HTTP status code
 */
function getUserFriendlyErrorMessage(status?: number, statusText?: string): string {
  if (!status) {
    return 'An error occurred while communicating with the server';
  }

  switch (status) {
    case 400:
      return 'Invalid request: Please check your input and try again';
    case 401:
      return 'Unauthorized: Please log in to continue';
    case 403:
      return 'Forbidden: You do not have permission to access this resource';
    case 404:
      return 'Not found: The requested resource could not be found';
    case 408:
      return 'Request timeout: The server took too long to respond';
    case 429:
      return 'Too many requests: Please wait a moment and try again';
    case 500:
      return 'Server error: Something went wrong on our end';
    case 502:
      return 'Bad gateway: The server is temporarily unavailable';
    case 503:
      return 'Service unavailable: The server is temporarily down for maintenance';
    case 504:
      return 'Gateway timeout: The server took too long to respond';
    default:
      if (status >= 400 && status < 500) {
        return `Client error (${status}): ${statusText || 'Request failed'}`;
      } else if (status >= 500) {
        return `Server error (${status}): ${statusText || 'Internal server error'}`;
      }
      return `Request failed (${status}): ${statusText || 'Unknown error'}`;
  }
}

/**
 * Log API errors for debugging (only in development)
 */
export function logApiError(error: ApiError, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`API Error${context ? `: ${context}` : ''}`);
    console.error('Message:', error.message);
    if (error.status) console.error('Status:', error.status, error.statusText);
    if (error.details) console.error('Details:', error.details);
    console.groupEnd();
  }
}
