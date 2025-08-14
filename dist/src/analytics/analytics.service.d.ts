import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentQueue } from '../entities/appointment-queue.entity';
export declare class AnalyticsService {
    private readonly appointmentRepo;
    private readonly queueRepo;
    constructor(appointmentRepo: Repository<Appointment>, queueRepo: Repository<AppointmentQueue>);
    getOverview(from?: string, to?: string): Promise<{
        success: boolean;
        data: {
            totalAppointments: number;
            statusBreakdown: {
                upcoming: number;
                completed: number;
                cancelled: number;
            };
            queue: {
                pending: number;
                scheduled: number;
                failed: number;
            };
        };
    }>;
    getDoctorAnalytics(doctorId: string, from?: string, to?: string): Promise<{
        success: boolean;
        data: {
            appointments: number;
            queue: number;
            statusBreakdown: {
                upcoming: number;
                completed: number;
                cancelled: number;
            };
        };
    }>;
    getQueueAnalytics(from?: string, to?: string): Promise<{
        success: boolean;
        data: {
            pending: number;
            scheduled: number;
            failed: number;
        };
    }>;
}
