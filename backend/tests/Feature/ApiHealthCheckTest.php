<?php

it('returns successful health check response', function () {
    $this->get('/up')
        ->assertOk()
        ->assertJson(['status' => 'ok']);
});

it('has api documentation accessible', function () {
    $this->get('/api/documentation')
        ->assertOk();
});

it('returns 401 for unauthenticated api/v1/user request', function () {
    $this->get('/api/v1/user')
        ->assertUnauthorized();
});

it('returns current user when authenticated', function () {
    $user = actingAsUser([
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
    ]);

    $this->get('/api/v1/user')
        ->assertOk()
        ->assertJson([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
        ]);
});
