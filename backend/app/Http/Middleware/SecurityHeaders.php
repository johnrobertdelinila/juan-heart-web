<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Security Headers Middleware
 *
 * Adds comprehensive security headers to all responses to protect against
 * common web vulnerabilities including XSS, clickjacking, MIME sniffing, etc.
 */
class SecurityHeaders
{
    /**
     * Handle an incoming request and add security headers to the response.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only add headers to actual responses (not BinaryFileResponse, etc.)
        if (!method_exists($response, 'header')) {
            return $response;
        }

        // Content Security Policy (CSP)
        // Restricts sources for scripts, styles, images, fonts, etc.
        $csp = $this->getContentSecurityPolicy();
        $response->header('Content-Security-Policy', $csp);

        // HTTP Strict Transport Security (HSTS)
        // Forces HTTPS connections for 1 year, including subdomains
        if ($request->secure() || app()->environment('production')) {
            $response->header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // X-Frame-Options
        // Prevents clickjacking by disallowing iframe embedding
        $response->header('X-Frame-Options', 'DENY');

        // X-Content-Type-Options
        // Prevents MIME-sniffing attacks
        $response->header('X-Content-Type-Options', 'nosniff');

        // X-XSS-Protection
        // Legacy XSS protection (still useful for older browsers)
        $response->header('X-XSS-Protection', '1; mode=block');

        // Referrer-Policy
        // Controls how much referrer information is shared
        $response->header('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions-Policy (formerly Feature-Policy)
        // Restricts browser features and APIs
        $permissionsPolicy = $this->getPermissionsPolicy();
        $response->header('Permissions-Policy', $permissionsPolicy);

        // Additional security headers

        // X-Permitted-Cross-Domain-Policies
        // Restricts Adobe Flash and PDF cross-domain requests
        $response->header('X-Permitted-Cross-Domain-Policies', 'none');

        // X-Download-Options
        // Prevents IE from executing downloads in site's context
        $response->header('X-Download-Options', 'noopen');

        // Cross-Origin-Embedder-Policy
        // Prevents cross-origin resource loading
        $response->header('Cross-Origin-Embedder-Policy', 'require-corp');

        // Cross-Origin-Opener-Policy
        // Isolates browsing context from cross-origin windows
        $response->header('Cross-Origin-Opener-Policy', 'same-origin');

        // Cross-Origin-Resource-Policy
        // Protects against certain cross-origin requests
        $response->header('Cross-Origin-Resource-Policy', 'same-origin');

        return $response;
    }

    /**
     * Get the Content Security Policy directives
     *
     * @return string
     */
    protected function getContentSecurityPolicy(): string
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        $apiUrl = config('app.url', 'http://localhost:8000');

        // Base CSP directives
        $directives = [
            // Default source for all resources
            "default-src 'self'",

            // Script sources - allow self and inline scripts with nonce/hash
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: 'unsafe-eval' needed for Next.js dev

            // Style sources - allow self and inline styles
            "style-src 'self' 'unsafe-inline'",

            // Image sources - allow self, data URIs, and HTTPS images
            "img-src 'self' data: https:",

            // Font sources - allow self and data URIs
            "font-src 'self' data:",

            // Connect sources - API and WebSocket connections
            "connect-src 'self' {$apiUrl} {$frontendUrl} ws: wss:",

            // Frame sources - disallow frames
            "frame-src 'none'",

            // Object sources - disallow plugins (Flash, Java, etc.)
            "object-src 'none'",

            // Media sources - allow self
            "media-src 'self'",

            // Form action - only allow same origin
            "form-action 'self'",

            // Frame ancestors - prevent clickjacking
            "frame-ancestors 'none'",

            // Base URI - restrict base tag
            "base-uri 'self'",

            // Upgrade insecure requests in production
            app()->environment('production') ? "upgrade-insecure-requests" : "",
        ];

        // Filter out empty directives and join
        return implode('; ', array_filter($directives));
    }

    /**
     * Get the Permissions Policy directives
     *
     * @return string
     */
    protected function getPermissionsPolicy(): string
    {
        // Disable most powerful features, allow only what's needed
        $policies = [
            'accelerometer=()',          // Deny accelerometer access
            'autoplay=()',               // Deny autoplay
            'camera=()',                 // Deny camera access
            'cross-origin-isolated=()',  // Deny cross-origin isolation
            'display-capture=()',        // Deny screen capture
            'encrypted-media=()',        // Deny encrypted media
            'fullscreen=(self)',         // Allow fullscreen only from same origin
            'geolocation=()',            // Deny geolocation (enable if needed for mobile)
            'gyroscope=()',              // Deny gyroscope
            'magnetometer=()',           // Deny magnetometer
            'microphone=()',             // Deny microphone
            'midi=()',                   // Deny MIDI access
            'payment=()',                // Deny payment API
            'picture-in-picture=()',     // Deny picture-in-picture
            'publickey-credentials-get=()', // Deny WebAuthn
            'screen-wake-lock=()',       // Deny wake lock
            'sync-xhr=()',               // Deny synchronous XHR
            'usb=()',                    // Deny USB access
            'web-share=()',              // Deny Web Share API
            'xr-spatial-tracking=()',    // Deny VR/AR tracking
        ];

        return implode(', ', $policies);
    }
}
