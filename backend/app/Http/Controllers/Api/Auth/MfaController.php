<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\EnableMfaRequest;
use App\Http\Requests\Api\Auth\VerifyMfaRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Twilio\Rest\Client;

class MfaController extends Controller
{
    /**
     * Enable MFA for the user.
     *
     * @param  \App\Http\Requests\Api\Auth\EnableMfaRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function enable(EnableMfaRequest $request): JsonResponse
    {
        $user = Auth::user();
        $user->phone = $request->phone;
        $user->mfa_method = 'sms';
        $user->save();

        $this->sendCode($user);

        return response()->json(['message' => 'MFA enabled. A verification code has been sent to your phone.']);
    }

    /**
     * Send the MFA code to the user.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function sendCode($user): void
    {
        $code = rand(100000, 999999);

        session(['mfa_code' => $code]);

        $client = new Client(config('services.twilio.sid'), config('services.twilio.token'));

        $client->messages->create($user->phone, [
            'from' => config('services.twilio.from'),
            'body' => 'Your MFA code is: ' . $code,
        ]);
    }

    /**
     * Verify the MFA code.
     *
     * @param  \App\Http\Requests\Api\Auth\VerifyMfaRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify(VerifyMfaRequest $request): JsonResponse
    {
        if ($request->code != session('mfa_code')) {
            return response()->json(['message' => 'Invalid MFA code.'], 400);
        }

        $user = Auth::user();
        $user->mfa_enabled = true;
        $user->save();

        session()->forget('mfa_code');

        return response()->json(['message' => 'MFA has been verified and enabled.']);
    }
}