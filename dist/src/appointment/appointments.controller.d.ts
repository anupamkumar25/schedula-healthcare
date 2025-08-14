import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './create-appointment.dto';
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
    };
}
export declare class AppointmentsController {
    private appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    private validateAppointmentId;
    createAppointment(req: AuthenticatedRequest, createAppointmentDto: CreateAppointmentDto): Promise<{
        queueId: string;
        note: string;
        patientId: string;
        doctorId: string;
        requestedDate: string;
        preferredTime: string;
        type: import("../entities/appointment.entity").AppointmentType;
        priority: import("../entities/appointment-queue.entity").QueuePriority;
        status: import("../entities/appointment-queue.entity").QueueStatus;
        originalAppointmentId: string;
        createdAt: Date;
        success: boolean;
        message: string;
    }>;
    getPatientAppointments(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: import("../entities/appointment.entity").Appointment[];
    }>;
    getDoctorAppointments(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: import("../entities/appointment.entity").Appointment[];
    }>;
    getAppointmentById(appointmentId: string): Promise<{
        success: boolean;
        data: import("../entities/appointment.entity").Appointment;
    }>;
    getAppointmentFromQueue(queueId: string): Promise<{
        success: boolean;
        data: import("../entities/appointment.entity").Appointment;
        queueStatus: import("../entities/appointment-queue.entity").QueueStatus;
        message?: undefined;
    } | {
        success: boolean;
        data: import("../entities/appointment-queue.entity").AppointmentQueue;
        message: string;
        queueStatus?: undefined;
    }>;
    cancelAppointment(req: AuthenticatedRequest, appointmentId: string): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/appointment.entity").Appointment;
    }>;
}
export {};
