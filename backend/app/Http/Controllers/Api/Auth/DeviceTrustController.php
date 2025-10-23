<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\StoreDeviceTrustRequest;
use App\Models\TrustedDevice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DeviceTrustController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        return response()->json(Auth::user()->trustedDevices);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\Api\Auth\StoreDeviceTrustRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreDeviceTrustRequest $request): JsonResponse
    {
        $trustedDevice = TrustedDevice::create([
            'user_id' => Auth::id(),
            'device_id' => $request->device_id,
            'device_name' => $request->device_name,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'last_login_at' => now(),
        ]);

        return response()->json($trustedDevice, 201);
    }
}