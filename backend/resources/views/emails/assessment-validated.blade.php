@extends('emails.layouts.base')

@section('title', 'Assessment Validated')
@section('header', 'Assessment Validated')

@section('content')
    <h2 style="color: #4caf50; margin-top: 0;">Your Assessment Has Been Approved</h2>

    <p>Hello {{ $user->full_name ?? $user->name }},</p>

    <p>Great news! A cardiovascular health assessment has been validated and approved by a clinician.</p>

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
            <th>Risk Level</th>
            <td>
                <strong style="color: {{ $assessment->final_risk_level === 'high' ? '#f44336' : ($assessment->final_risk_level === 'medium' ? '#ff9800' : '#4caf50') }}">
                    {{ ucfirst($assessment->final_risk_level) }}
                </strong>
            </td>
        </tr>
        <tr>
            <th>Risk Score</th>
            <td>{{ $assessment->final_risk_score }}/25</td>
        </tr>
        @if($assessment->validated_at)
        <tr>
            <th>Validated On</th>
            <td>{{ $assessment->validated_at->format('F j, Y g:i A') }}</td>
        </tr>
        @endif
    </table>
    @endif

    @if(isset($clinician_notes))
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #666; font-size: 14px;">Clinician Notes:</h3>
        <p style="margin: 0;">{{ $clinician_notes }}</p>
    </div>
    @endif

    @if(isset($action_url))
    <a href="{{ $action_url }}" class="button">View Full Assessment</a>
    @endif

    <p style="margin-top: 25px; color: #666; font-size: 14px;">
        If you have any questions about this assessment, please contact your healthcare provider.
    </p>
@endsection
