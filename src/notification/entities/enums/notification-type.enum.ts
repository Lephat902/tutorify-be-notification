export enum NotificationType {
    // Class Application
    TUTORING_REQUEST_CREATED = 'tutoring-request-created',
    TUTORING_REQUEST_APPROVED = 'tutoring-request-approved',
    TUTORING_REQUEST_REJECTED = 'tutoring-request-rejected',
    CLASS_APPLICATION_CREATED = 'class-application-created',
    CLASS_APPLICATION_APPROVED = 'class-application-approved',
    CLASS_APPLICATION_REJECTED = 'class-application-rejected',
    CLASS_APPLICATION_CANCELLED = 'class-application-cancelled',
    // Tutor feedback
    TUTOR_FEEDBACK_CREATED = 'tutor-feedback-created',
    // Class session
    CLASS_SESSION_CREATED = 'session-created',
    CLASS_SESSION_CANCELLED = 'session-cancelled',
    CLASS_SESSION_DELETED = 'session-deleted',
    CLASS_SESSION_FEEDBACK_UPDATED = 'session-feedback-updated',
}