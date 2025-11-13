@extends('emails.layouts.base')

@section('title', 'New Referral Assigned')
@section('header', 'New Patient Referral')

@section('content')
    <h2 style="color: #9c27b0; margin-top: 0;">You Have Been Assigned a New Referral</h2>

    <p>Hello Dr. {{ $user->last_name ?? $user->name }},</p>

    <p>A new patient referral has been assigned to you for review and follow-up.</p>

    @if(isset($referral))
    <table class="data-table">
        <tr>
            <th>Referral ID</th>
            <td>#{{ $referral->id }}</td>
        </tr>
        @if(isset($referral->patient))
        <tr>
            <th>Patient</th>
            <td>{{ $referral->patient->full_name ?? 'N/A' }}</td>
        </tr>
        @endif
        <tr>
            <th>Priority</th>
            <td>
                <strong style="color: {{ $referral->priority === 'urgent' ? '#c62828' : ($referral->priority === 'high' ? '#d84315' : '#666') }}">
                    {{ ucfirst($referral->priority ?? 'normal') }}
                </strong>
            </td>
        </tr>
        <tr>
            <th>Reason</th>
            <td>{{ $referral->reason ?? 'N/A' }}</td>
        </tr>
        @if(isset($referral->referringUser))
        <tr>
            <th>Referred By</th>
            <td>{{ $referral->referringUser->full_name ?? $referral->referringUser->name }}</td>
        </tr>
        @endif
        <tr>
            <th>Date</th>
            <td>{{ $referral->created_at->format('F j, Y g:i A') }}</td>
        </tr>
    </table>
    @endif

    @if(isset($clinical_notes))
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #666; font-size: 14px;">Clinical Notes:</h3>
        <p style="margin: 0;">{{ $clinical_notes }}</p>
    </div>
    @endif

    @if(isset($assessment_summary))
    <div style="background-color: #f3e5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #7b1fa2; font-size: 14px;">Assessment Summary:</h3>
        <p style="margin: 0;">{{ $assessment_summary }}</p>
    </div>
    @endif

    @if(isset($action_url))
    <a href="{{ $action_url }}" class="button">Review Referral</a>
    @endif

    <p style="margin-top: 25px; color: #666; font-size: 14px;">
        Please review this referral at your earliest convenience and update the status accordingly.
    </p>
@endsection
