<?php

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        apiPrefix: 'api/v1',
        then: function () {
            // Configure custom rate limiters with environment-aware limits
            $isProduction = app()->environment('production');

            RateLimiter::for('api', function (Request $request) use ($isProduction) {
                $limit = $isProduction ? 60 : 1000;
                return Limit::perMinute($limit)->by($request->user()?->id ?: $request->ip());
            });

            // Mobile endpoints - more permissive for mobile apps
            RateLimiter::for('mobile', function (Request $request) use ($isProduction) {
                $limit = $isProduction ? 100 : 1000;
                return Limit::perMinute($limit)->by($request->user()?->id ?: $request->ip());
            });

            // Authentication endpoints - stricter to prevent brute force
            RateLimiter::for('auth', function (Request $request) use ($isProduction) {
                $limit = $isProduction ? 5 : 20;
                return Limit::perMinute($limit)->by($request->ip());
            });

            // Public endpoints - moderate limits
            RateLimiter::for('public', function (Request $request) use ($isProduction) {
                $limit = $isProduction ? 30 : 1000;
                return Limit::perMinute($limit)->by($request->ip());
            });

            // Export endpoints - lower limits due to resource intensity
            RateLimiter::for('export', function (Request $request) use ($isProduction) {
                $limit = $isProduction ? 10 : 100;
                return Limit::perMinute($limit)->by($request->user()?->id ?: $request->ip());
            });

            // Bulk upload endpoints - lower limits
            RateLimiter::for('bulk', function (Request $request) use ($isProduction) {
                $limit = $isProduction ? 20 : 200;
                return Limit::perMinute($limit)->by($request->user()?->id ?: $request->ip());
            });
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Add security headers to all requests
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // Handle CORS for API requests
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Configure trusted proxies for production (CloudFlare, AWS Load Balancer)
        $middleware->trustProxies(at: '*');

        // Configure rate limiting
        $middleware->throttleApi();

        // Sanctum configuration
        $middleware->statefulApi();

        // Register custom middleware aliases
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'permission' => \App\Http\Middleware\CheckPermission::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle rate limit exceptions and return JSON responses for API routes
        $exceptions->render(function (TooManyRequestsHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Too many requests. Please slow down.',
                    'error' => 'RATE_LIMIT_EXCEEDED',
                    'retry_after' => $e->getHeaders()['Retry-After'] ?? 60
                ], 429, $e->getHeaders());
            }
        });
    })->create();
