import { AppointmentType } from './appointment.entity';
export declare enum QueueStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SCHEDULED = "scheduled",
    FAILED = "failed"
}
export declare enum QueuePriority {
    HIGH = 1,
    NORMAL = 2
}
export declare class AppointmentQueue {
    queueId: string;
    patientId: string;
    doctorId: string;
    requestedDate: string;
    preferredTime: string;
    type: AppointmentType;
    priority: QueuePriority;
    status: QueueStatus;
    originalAppointmentId: string;
    createdAt: Date;
}
