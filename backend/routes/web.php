<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Login route for API authentication redirects
Route::get('/login', function () {
    return response()->json([
        'message' => 'Unauthorized. Please login via the API.',
        'login_url' => '/api/auth/login',
    ], 401);
})->name('login');

// Health check endpoint
Route::get('/up', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'service' => 'Juan Heart Web API',
    ]);
});
