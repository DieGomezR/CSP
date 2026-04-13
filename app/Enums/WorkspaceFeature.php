<?php

declare(strict_types=1);

namespace App\Enums;

enum WorkspaceFeature: string
{
    case FamilyCalendar = 'family_calendar';
    case SchoolCalendarSync = 'school_calendar_sync';
    case WebcalSync = 'webcal_sync';
    case EmailReminders = 'email_reminders';
    case CaregiverGuestAccess = 'caregiver_guest_access';
    case AiCalendarImport = 'ai_calendar_import';
    case ActivityTracking = 'activity_tracking';
    case SmsReminders = 'sms_reminders';
    case ExpenseTracking = 'expense_tracking';
    case SecureMessaging = 'secure_messaging';
    case CustodyScheduleTemplates = 'custody_schedule_templates';
    case CourtReadyExports = 'court_ready_exports';
    case AiToneAnalysis = 'ai_tone_analysis';
    case ChangeRequestWorkflow = 'change_request_workflow';
    case AuditTrail = 'audit_trail';
}
