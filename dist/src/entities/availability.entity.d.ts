import { Doctor } from './doctor.entity';
export declare enum DayOfWeek {
    MONDAY = "monday",
    TUESDAY = "tuesday",
    WEDNESDAY = "wednesday",
    THURSDAY = "thursday",
    FRIDAY = "friday",
    SATURDAY = "saturday",
    SUNDAY = "sunday"
}
export declare class Availability {
    availabilityId: string;
    doctorId: string;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    doctor: Doctor;
}
