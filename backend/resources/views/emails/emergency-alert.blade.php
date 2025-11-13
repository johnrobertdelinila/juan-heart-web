@extends('emails.layouts.base')

@section('title', 'Emergency Alert')
@section('header', 'EMERGENCY ALERT')

@section('content')
    <div style="background-color: #ffebee; border-left: 6px solid #c62828; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #c62828; margin-top: 0; font-size: 22px;">
            ⚠️ {{ $alert->title ?? 'URGENT: Emergency Alert' }}
        </h2>
    </div>

    <p>Hello {{ $user->full_name ?? $user->name }},</p>

    @if(isset($alert))
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 15px 0;">
        <p style="font-size: 16px; line-height: 1.8; margin: 0;">
            {{ $alert->message }}
        </p>
    </div>

    <table class="data-table" style="margin-top: 20px;">
        <tr>
            <th>Severity</th>
            <td>
                <strong style="color: {{ $alert->severity === 'emergency' ? '#c62828' : ($alert->severity === 'critical' ? '#d84315' : ($alert->severity === 'warning' ? '#f57c00' : '#1976d2')) }}">
                    {{ strtoupper($alert->severity) }}
                </strong>
            </td>
        </tr>
        <tr>
            <th>Issued At</th>
            <td>{{ $alert->created_at->format('F j, Y g:i A') }}</td>
        </tr>
        @if($alert->expires_at)
        <tr>
            <th>Expires At</th>
            <td>{{ $alert->expires_at->format('F j, Y g:i A') }}</td>
        </tr>
        @endif
        @if(isset($alert->creator))
        <tr>
            <th>Issued By</th>
            <td>{{ $alert->creator->full_name ?? $alert->creator->name }}</td>
        </tr>
        @endif
    </table>
    @endif

    @if(isset($action_required))
    <div style="background-color: #fff3e0; border: 2px solid #ff9800; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #e65100; font-size: 16px;">⚡ Action Required:</h3>
        <p style="margin: 0; font-size: 15px;">{{ $action_required }}</p>
    </div>
    @endif

    @if(isset($acknowledge_url))
    <a href="{{ $acknowledge_url }}" class="button" style="background: #c62828; font-size: 16px; padding: 15px 30px;">
        Acknowledge This Alert
    </a>
    @endif

    <p style="margin-top: 30px; color: #666; font-size: 13px; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
        <strong>Note:</strong> This is an urgent notification that requires your immediate attention.
        Please acknowledge receipt of this alert as soon as possible.
    </p>
@endsection
