@extends('emails.layouts.base')

@section('title', 'Appointment Confirmation')
@section('header', 'Appointment Confirmed')

@section('content')
    <h2 style="color: #2196f3; margin-top: 0;">Your Appointment is Confirmed</h2>

    <p>Hello {{ $user->full_name ?? $user->name }},</p>

    <p>Your appointment has been successfully scheduled.</p>

    @if(isset($appointment))
    <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%;">
            <tr>
                <td style="padding: 8px 0;"><strong>Date:</strong></td>
                <td style="padding: 8px 0;">{{ $appointment->appointment_date ? $appointment->appointment_date->format('l, F j, Y') : 'TBD' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Time:</strong></td>
                <td style="padding: 8px 0;">{{ $appointment->appointment_time ?? 'TBD' }}</td>
            </tr>
            @if(isset($appointment->facility))
            <tr>
                <td style="padding: 8px 0;"><strong>Location:</strong></td>
                <td style="padding: 8px 0;">{{ $appointment->facility->name }}</td>
            </tr>
            @endif
            @if(isset($appointment->doctor))
            <tr>
                <td style="padding: 8px 0;"><strong>Doctor:</strong></td>
                <td style="padding: 8px 0;">Dr. {{ $appointment->doctor->full_name ?? $appointment->doctor->name }}</td>
            </tr>
            @endif
            <tr>
                <td style="padding: 8px 0;"><strong>Type:</strong></td>
                <td style="padding: 8px 0;">{{ ucfirst($appointment->type ?? 'consultation') }}</td>
            </tr>
        </table>
    </div>
    @endif

    @if(isset($appointment->notes))
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #666; font-size: 14px;">Special Instructions:</h3>
        <p style="margin: 0;">{{ $appointment->notes }}</p>
    </div>
    @endif

    <div style="background-color: #fff3e0; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #e65100; font-size: 14px;">Important Reminders:</h3>
        <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Please arrive 15 minutes before your appointment time</li>
            <li>Bring your government-issued ID and insurance card</li>
            <li>Bring any relevant medical records or test results</li>
        </ul>
    </div>

    @if(isset($action_url))
    <a href="{{ $action_url }}" class="button">View Appointment Details</a>
    @endif

    <p style="margin-top: 25px; color: #666; font-size: 14px;">
        If you need to reschedule or cancel, please contact us at least 24 hours in advance.
    </p>
@endsection
