import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';
export declare enum AppointmentStatus {
    UPCOMING = "upcoming",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum AppointmentType {
    ROUTINE = "routine",
    FOLLOWUP = "follow-up",
    NEWPATIENT = "new-patient",
    EMERGENCY = "emergency"
}
export declare class Appointment {
    appointmentId: string;
    doctorId: string;
    patientId: string;
    appointmentDate: string;
    appointmentTime: string;
    actualStartTime: string;
    actualEndTime: string;
    duration: number;
    tokenNumber: string;
    status: AppointmentStatus;
    type: AppointmentType;
    complaint: string;
    createdAt: Date;
    updatedAt: Date;
    doctor: Doctor;
    patient: Patient;
}
