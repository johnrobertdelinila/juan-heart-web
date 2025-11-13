@extends('emails.layouts.base')

@section('title', $title ?? 'Notification')
@section('header', $title ?? 'Juan Heart Web Notification')

@section('content')
    @if(isset($user))
        <p>Hello {{ $user->full_name ?? $user->name }},</p>
    @endif

    @if(isset($message) && is_string($message))
        <div style="font-size: 15px; line-height: 1.8;">
            {!! nl2br(e($message)) !!}
        </div>
    @endif

    @if(isset($data) && is_array($data) && count($data) > 0)
        <table class="data-table" style="margin-top: 20px;">
            @foreach($data as $key => $value)
                @if(!in_array($key, ['action_url', 'view', 'view_data', 'priority']))
                    <tr>
                        <th>{{ ucfirst(str_replace('_', ' ', $key)) }}</th>
                        <td>{{ is_array($value) ? json_encode($value) : $value }}</td>
                    </tr>
                @endif
            @endforeach
        </table>
    @endif

    @if(isset($action_url) && $action_url)
        <a href="{{ $action_url }}" class="button">View Details</a>
    @endif
@endsection
