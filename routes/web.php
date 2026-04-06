<?php

use App\Http\Controllers\FamilyCalendarController;
use App\Http\Controllers\Onboarding\FamilyOnboardingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('onboarding/family', [FamilyOnboardingController::class, 'create'])->name('onboarding.family.create');
    Route::post('onboarding/family', [FamilyOnboardingController::class, 'store'])->name('onboarding.family.store');

    Route::get('dashboard', [FamilyCalendarController::class, 'index'])->name('dashboard');
    Route::post('workspaces/{workspace}/events', [FamilyCalendarController::class, 'store'])->name('workspaces.events.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
