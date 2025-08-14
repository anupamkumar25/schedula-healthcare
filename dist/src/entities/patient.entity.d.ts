import { Appointment } from './appointment.entity';
export declare class Patient {
    patientId: string;
    mobNum: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    appointments: Appointment[];
    dob: Date;
    toJSON(): Omit<this, "password" | "toJSON">;
}
