<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * Check if the authenticated user has the required role(s).
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Check if user has any of the required roles
        if (!$request->user()->hasAnyRole($roles)) {
            return response()->json([
                'message' => 'Forbidden. You do not have the required role to access this resource.',
                'required_roles' => $roles,
                'your_roles' => $request->user()->getRoleNames(),
            ], 403);
        }

        return $next($request);
    }
}
