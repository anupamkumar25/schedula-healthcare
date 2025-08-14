import { AppointmentType } from 'src/entities/appointment.entity';
export declare class CreateAppointmentDto {
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    type?: AppointmentType;
    complaint?: string;
}
