<?php

use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('registration screen can be rendered', function () {
    $response = $this->get('/signup');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $response = $this->post('/signup', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'phone_number' => '+1 (555) 123-4567',
        'family_name' => 'Test Family',
        'timezone' => 'America/New_York',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('verification.notice', absolute: false));
});
