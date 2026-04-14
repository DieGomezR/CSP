<?php

use App\Http\Controllers\AppearanceController;
use App\Http\Controllers\Admin\MediationEscalationController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CalendarFeedSubscriptionController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\Billing\BillingCheckoutController;
use App\Http\Controllers\Billing\BillingPageController;
use App\Http\Controllers\Billing\BillingPortalController;
use App\Http\Controllers\Billing\BillingSuccessController;
use App\Http\Controllers\FamilyCalendarController;
use App\Http\Controllers\MomentController;
use App\Http\Controllers\MomentReactionController;
use App\Http\Controllers\MediationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Onboarding\FamilyOnboardingController;
use App\Http\Controllers\WorkspaceCalendarFeedController;
use App\Http\Controllers\WorkspaceInvitationController;
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

Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');

Route::get('calendar-feeds/{token}/family.ics', [CalendarFeedSubscriptionController::class, 'show'])
    ->name('calendar-feeds.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');

    Route::middleware('can:admin.access')->group(function () {
        Route::get('admin/mediation/escalations', [MediationEscalationController::class, 'index'])->name('admin.mediation.escalations');
    });

    Route::get('onboarding/family', [FamilyOnboardingController::class, 'create'])->name('onboarding.family.create');
    Route::post('onboarding/family', [FamilyOnboardingController::class, 'store'])->name('onboarding.family.store');

    Route::middleware('workspace.ability:billing.manage')->group(function () {
        Route::get('billing', [BillingPageController::class, 'index'])->name('billing');
        Route::post('billing/checkout', [BillingCheckoutController::class, 'store'])->name('billing.checkout');
        Route::post('billing/portal', [BillingPortalController::class, 'store'])->name('billing.portal');
        Route::get('billing/success', [BillingSuccessController::class, 'show'])->name('billing.success');
    });

    Route::middleware('workspace.subscription')->group(function () {
        Route::get('dashboard', [FamilyCalendarController::class, 'index'])->name('dashboard');
        Route::get('calendar', [FamilyCalendarController::class, 'calendar'])->name('calendar');
        Route::middleware('workspace.feature:secure_messaging')->group(function () {
            Route::get('messages', [MessageController::class, 'index'])->name('messages.index');
            Route::post('messages/threads', [MessageController::class, 'storeThread'])->name('messages.threads.store');
            Route::post('messages', [MessageController::class, 'store'])->name('messages.store');
        });
        Route::get('moments', [MomentController::class, 'index'])->name('moments.index');
        Route::get('moments/create', [MomentController::class, 'create'])->name('moments.create');
        Route::post('moments', [MomentController::class, 'store'])->name('moments.store');
        Route::delete('moments/{moment}', [MomentController::class, 'destroy'])->name('moments.destroy');
        Route::get('moments/{moment}/image', [MomentController::class, 'image'])->name('moments.image');
        Route::post('moments/{moment}/reactions', [MomentReactionController::class, 'store'])->name('moments.reactions.store');
        Route::middleware('workspace.feature:ai_tone_analysis')->group(function () {
            Route::get('mediation', [MediationController::class, 'index'])->name('mediation.index');
            Route::post('mediation', [MediationController::class, 'store'])->name('mediation.store');
            Route::get('mediation/session/{mediationSession}', [MediationController::class, 'show'])->name('mediation.show');
            Route::post('mediation/session/{mediationSession}/messages', [MediationController::class, 'send'])->name('mediation.messages.store');
            Route::post('mediation/session/{mediationSession}/help', [MediationController::class, 'askAiForHelp'])->name('mediation.help');
            Route::post('mediation/session/{mediationSession}/resolve', [MediationController::class, 'resolve'])->name('mediation.resolve');
            Route::post('mediation/session/{mediationSession}/cancel', [MediationController::class, 'cancel'])->name('mediation.cancel');
        });
        Route::middleware('workspace.feature:court_ready_exports')->group(function () {
            Route::get('mediation/court-report', [MediationController::class, 'report'])->name('mediation.report');
            Route::get('mediation/court-report/print', [MediationController::class, 'printReport'])->name('mediation.report.print');
        });
        Route::middleware(['workspace.ability:expenses.view', 'workspace.feature:expense_tracking'])->group(function () {
            Route::get('expenses', [ExpenseController::class, 'index'])->name('expenses.index');
            Route::get('expenses/create', [ExpenseController::class, 'create'])->name('expenses.create');
            Route::post('expenses', [ExpenseController::class, 'store'])->name('expenses.store');
            Route::get('expenses/{expense}/edit', [ExpenseController::class, 'edit'])->name('expenses.edit');
            Route::put('expenses/{expense}', [ExpenseController::class, 'update'])->name('expenses.update');
            Route::post('expenses/{expense}/accept', [ExpenseController::class, 'accept'])->name('expenses.accept');
            Route::post('expenses/{expense}/reopen', [ExpenseController::class, 'reopen'])->name('expenses.reopen');
            Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
        });
        Route::middleware(['workspace.ability:custody.manage', 'workspace.feature:custody_schedule_templates'])->group(function () {
            Route::get('calendar/schedule-wizard', [FamilyCalendarController::class, 'scheduleWizard'])->name('calendar.schedule-wizard');
            Route::post('workspaces/{workspace}/schedule-wizard', [FamilyCalendarController::class, 'storeScheduleWizard'])
                ->name('workspaces.schedule-wizard.store');
        });
        Route::middleware(['workspace.ability:custody.manage', 'workspace.feature:webcal_sync'])->group(function () {
            Route::post('workspaces/{workspace}/calendar-feeds', [WorkspaceCalendarFeedController::class, 'store'])
                ->name('workspaces.calendar-feeds.store');
            Route::delete('workspaces/{workspace}/calendar-feeds/{calendarFeed}', [WorkspaceCalendarFeedController::class, 'destroy'])
                ->name('workspaces.calendar-feeds.destroy');
        });
        Route::post('workspaces/{workspace}/events', [FamilyCalendarController::class, 'store'])->name('workspaces.events.store');

        Route::middleware('workspace.ability:custody.manage')->group(function () {
            Route::get('workspaces/{workspace}/children', [ChildController::class, 'index'])->name('children.index');
            Route::post('workspaces/{workspace}/children', [ChildController::class, 'store'])->name('children.store');
            Route::put('workspaces/{workspace}/children/{child}', [ChildController::class, 'update'])->name('children.update');
            Route::delete('workspaces/{workspace}/children/{child}', [ChildController::class, 'destroy'])->name('children.destroy');
        });

        Route::middleware('workspace.ability:billing.manage')->group(function () {
            Route::get('workspaces/{workspace}/members', [WorkspaceInvitationController::class, 'index'])->name('workspace.members.index');
            Route::post('workspaces/{workspace}/members', [WorkspaceInvitationController::class, 'store'])->name('workspace.members.store');
            Route::put('workspaces/{workspace}/members/{member}', [WorkspaceInvitationController::class, 'update'])->name('workspace.members.update');
            Route::delete('workspaces/{workspace}/members/{member}', [WorkspaceInvitationController::class, 'destroy'])->name('workspace.members.destroy');
            Route::post('workspaces/{workspace}/invitations/{invitation}/cancel', [WorkspaceInvitationController::class, 'cancelInvitation'])->name('workspace.invitations.cancel');
            Route::post('workspaces/{workspace}/invitations/{invitation}/resend', [WorkspaceInvitationController::class, 'resendInvitation'])->name('workspace.invitations.resend');
        });

        Route::post('appearance', [AppearanceController::class, 'store'])->name('appearance.store');
        Route::get('appearance', [AppearanceController::class, 'show'])->name('appearance.show');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
