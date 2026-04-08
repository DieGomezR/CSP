<?php

use App\Http\Controllers\CalendarFeedSubscriptionController;
use App\Http\Controllers\FamilyCalendarController;
use App\Http\Controllers\Onboarding\FamilyOnboardingController;
use App\Http\Controllers\WorkspaceCalendarFeedController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/for-coparents', function () {
    return Inertia::render('for-coparents');
})->name('for-coparents');

Route::get('/for-teams', function () {
    return Inertia::render('for-teams');
})->name('for-teams');

Route::get('/pta', function () {
    return Inertia::render('pta');
})->name('pta');

Route::get('calendar-feeds/{token}/family.ics', [CalendarFeedSubscriptionController::class, 'show'])
    ->name('calendar-feeds.show');

Route::middleware(['auth'])->group(function () {
    Route::get('onboarding/family', [FamilyOnboardingController::class, 'create'])->name('onboarding.family.create');
    Route::post('onboarding/family', [FamilyOnboardingController::class, 'store'])->name('onboarding.family.store');

    Route::get('dashboard', [FamilyCalendarController::class, 'index'])->name('dashboard');
    Route::get('calendar', [FamilyCalendarController::class, 'calendar'])->name('calendar');
    Route::get('calendar/schedule-wizard', [FamilyCalendarController::class, 'scheduleWizard'])->name('calendar.schedule-wizard');
    Route::post('workspaces/{workspace}/schedule-wizard', [FamilyCalendarController::class, 'storeScheduleWizard'])
        ->name('workspaces.schedule-wizard.store');
    Route::post('workspaces/{workspace}/events', [FamilyCalendarController::class, 'store'])->name('workspaces.events.store');
    Route::post('workspaces/{workspace}/calendar-feeds', [WorkspaceCalendarFeedController::class, 'store'])
        ->name('workspaces.calendar-feeds.store');
    Route::delete('workspaces/{workspace}/calendar-feeds/{calendarFeed}', [WorkspaceCalendarFeedController::class, 'destroy'])
        ->name('workspaces.calendar-feeds.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
