import { Availability } from './availability.entity';
import { Appointment } from './appointment.entity';
export declare class Doctor {
    doctorId: string;
    name: string;
    email: string;
    password: string;
    speciality: string;
    yearOfExp: number;
    bio: string;
    createdAt: Date;
    updatedAt: Date;
    availabilities: Availability[];
    appointments: Appointment[];
    toJSON(): Omit<this, "password" | "toJSON">;
}
