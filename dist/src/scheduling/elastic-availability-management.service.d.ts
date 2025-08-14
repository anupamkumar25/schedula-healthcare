import { Repository } from 'typeorm';
import { TemporaryAvailability } from '../entities/temporary-availability.entity';
import { AppointmentQueue } from '../entities/appointment-queue.entity';
import { Appointment } from '../entities/appointment.entity';
import { Availability } from '../entities/availability.entity';
import { SegmentTreeService } from './segment-tree.service';
export declare class AvailabilityManagementService {
    private tempAvailabilityRepo;
    private queueRepo;
    private appointmentRepo;
    private availabilityRepo;
    private segmentTreeService;
    constructor(tempAvailabilityRepo: Repository<TemporaryAvailability>, queueRepo: Repository<AppointmentQueue>, appointmentRepo: Repository<Appointment>, availabilityRepo: Repository<Availability>, segmentTreeService: SegmentTreeService);
    expandAvailability(doctorId: string, newEndTime: string, date?: string, day?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            targetDate: string;
            targetDay: string;
            originalEndTime: string;
            newEndTime: string;
            additionalSlots: number;
            queueEntriesProcessed: number;
        };
    }>;
    shrinkAvailability(doctorId: string, newEndTime: string, date?: string, day?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            targetDate: string;
            targetDay: string;
            originalEndTime: string;
            newEndTime: string;
            affectedAppointments: number;
            queueEntriesCreated: number;
        };
    }>;
    private processExpansion;
    private processShrinking;
    getCurrentAvailability(doctorId: string, date: string, day?: string): Promise<Availability | {
        startTime: string;
        endTime: string;
    } | null>;
    private findAffectedAppointments;
    createAppointmentFromQueue(queueEntry: AppointmentQueue, appointmentTime: string, effectiveDate: string): Promise<Appointment>;
    private getDayOfWeek;
    private mapDayStringToEnum;
    private timeToMinutes;
    private minutesToTime;
}
