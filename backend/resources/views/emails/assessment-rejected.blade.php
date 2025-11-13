@extends('emails.layouts.base')

@section('title', 'Assessment Needs Review')
@section('header', 'Assessment Requires Attention')

@section('content')
    <h2 style="color: #ff9800; margin-top: 0;">Assessment Needs Additional Review</h2>

    <p>Hello {{ $user->full_name ?? $user->name }},</p>

    <p>An assessment has been flagged for additional review by a clinician.</p>

    @if(isset($assessment))
    <table class="data-table">
        <tr>
            <th>Assessment ID</th>
            <td>#{{ $assessment->id }}</td>
        </tr>
        @if($assessment->assessment_external_id)
        <tr>
            <th>External ID</th>
            <td>{{ $assessment->assessment_external_id }}</td>
        </tr>
        @endif
        <tr>
            <th>Status</th>
            <td><strong style="color: #ff9800;">{{ ucfirst($assessment->status) }}</strong></td>
        </tr>
    </table>
    @endif

    @if(isset($reason))
    <div style="background-color: #fff3e0; padding: 15px; border-radius: 4px; border-left: 4px solid #ff9800; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #e65100; font-size: 14px;">Reason for Review:</h3>
        <p style="margin: 0;">{{ $reason }}</p>
    </div>
    @endif

    @if(isset($next_steps))
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #666; font-size: 14px;">Next Steps:</h3>
        <p style="margin: 0;">{{ $next_steps }}</p>
    </div>
    @endif

    @if(isset($action_url))
    <a href="{{ $action_url }}" class="button">View Assessment Details</a>
    @endif

    <p style="margin-top: 25px; color: #666; font-size: 14px;">
        This is part of our quality assurance process to ensure the best care for our patients.
    </p>
@endsection
