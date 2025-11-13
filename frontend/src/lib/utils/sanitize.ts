/**
 * HTML Sanitization Utility
 *
 * Provides comprehensive XSS protection for user-generated content.
 * Uses DOMPurify-like approach to sanitize HTML while preserving safe formatting.
 */

/**
 * Configuration for allowed HTML tags and attributes
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code', 'span', 'div', 'a', 'img',
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'title', 'target', 'rel'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'span': ['class'],
  'div': ['class'],
};

const ALLOWED_PROTOCOLS = ['http', 'https', 'mailto', 'tel'];

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * @param html - Raw HTML string to sanitize
 * @param options - Optional configuration
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(
  html: string,
  options: {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedProtocols?: string[];
  } = {}
): string {
  const allowedTags = options.allowedTags || ALLOWED_TAGS;
  const allowedAttributes = options.allowedAttributes || ALLOWED_ATTRIBUTES;
  const allowedProtocols = options.allowedProtocols || ALLOWED_PROTOCOLS;

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Recursively sanitize all nodes
  sanitizeNode(tempDiv, allowedTags, allowedAttributes, allowedProtocols);

  return tempDiv.innerHTML;
}

/**
 * Recursively sanitize DOM nodes
 */
function sanitizeNode(
  node: HTMLElement,
  allowedTags: string[],
  allowedAttributes: Record<string, string[]>,
  allowedProtocols: string[]
): void {
  const nodesToRemove: Node[] = [];

  // Process all child nodes
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      // Remove disallowed tags
      if (!allowedTags.includes(tagName)) {
        nodesToRemove.push(child);
        return;
      }

      // Remove disallowed attributes
      const attrs = Array.from(element.attributes);
      attrs.forEach((attr) => {
        const attrName = attr.name.toLowerCase();

        // Remove event handlers (onclick, onload, etc.)
        if (attrName.startsWith('on')) {
          element.removeAttribute(attr.name);
          return;
        }

        // Check if attribute is allowed for this tag
        const allowedAttrs = allowedAttributes[tagName] || [];
        if (!allowedAttrs.includes(attrName)) {
          element.removeAttribute(attr.name);
          return;
        }

        // Validate URLs in href and src attributes
        if (attrName === 'href' || attrName === 'src') {
          const value = attr.value.trim().toLowerCase();

          // Remove javascript:, data:, vbscript: protocols
          if (
            value.startsWith('javascript:') ||
            value.startsWith('data:') ||
            value.startsWith('vbscript:') ||
            value.startsWith('file:')
          ) {
            element.removeAttribute(attr.name);
            return;
          }

          // Validate allowed protocols
          const hasAllowedProtocol = allowedProtocols.some((protocol) =>
            value.startsWith(`${protocol}:`)
          );

          // Allow relative URLs and fragment identifiers
          const isRelativeUrl = value.startsWith('/') || value.startsWith('#') || value.startsWith('.');

          if (!hasAllowedProtocol && !isRelativeUrl) {
            element.removeAttribute(attr.name);
          }
        }
      });

      // Recursively sanitize child elements
      sanitizeNode(element, allowedTags, allowedAttributes, allowedProtocols);
    } else if (child.nodeType === Node.TEXT_NODE) {
      // Text nodes are safe, no action needed
    } else {
      // Remove other node types (comments, CDATA, etc.)
      nodesToRemove.push(child);
    }
  });

  // Remove marked nodes
  nodesToRemove.forEach((nodeToRemove) => {
    node.removeChild(nodeToRemove);
  });
}

/**
 * Strip all HTML tags from a string
 *
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

/**
 * Escape HTML special characters
 *
 * @param text - Text to escape
 * @returns Escaped text safe for HTML insertion
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Unescape HTML entities
 *
 * @param html - HTML with entities
 * @returns Unescaped text
 */
export function unescapeHtml(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || '';
}

/**
 * Sanitize user input for clinical notes (allows more formatting)
 *
 * @param html - Raw HTML from rich text editor
 * @returns Sanitized HTML safe for clinical notes
 */
export function sanitizeClinicalNotes(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
      'span', 'div',
    ],
    allowedAttributes: {
      'span': ['class'],
      'div': ['class'],
    },
    allowedProtocols: [],
  });
}

/**
 * Sanitize search input to prevent XSS in search results
 *
 * @param input - Search query string
 * @returns Sanitized search string
 */
export function sanitizeSearchInput(input: string): string {
  // Remove all HTML tags and scripts
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove any potential script content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Limit length to prevent DoS
  return sanitized.slice(0, 500);
}

/**
 * Validate and sanitize URL
 *
 * @param url - URL string to validate
 * @param allowedProtocols - Allowed URL protocols
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(
  url: string,
  allowedProtocols: string[] = ['http', 'https']
): string {
  try {
    const trimmedUrl = url.trim().toLowerCase();

    // Check for dangerous protocols
    if (
      trimmedUrl.startsWith('javascript:') ||
      trimmedUrl.startsWith('data:') ||
      trimmedUrl.startsWith('vbscript:') ||
      trimmedUrl.startsWith('file:')
    ) {
      return '';
    }

    // Validate URL format
    const urlObject = new URL(url);

    // Check if protocol is allowed
    const protocol = urlObject.protocol.replace(':', '');
    if (!allowedProtocols.includes(protocol)) {
      return '';
    }

    return url;
  } catch {
    // Invalid URL, return empty string
    return '';
  }
}
