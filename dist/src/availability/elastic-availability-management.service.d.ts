import { Repository } from 'typeorm';
import { TemporaryAvailability } from '../entities/temporary-availability.entity';
import { AppointmentQueue } from '../entities/appointment-queue.entity';
import { Appointment } from '../entities/appointment.entity';
import { Availability } from '../entities/availability.entity';
import { SegmentTreeService } from 'src/segment-tree.service';
export declare class AvailabilityManagementService {
    private tempAvailabilityRepo;
    private queueRepo;
    private appointmentRepo;
    private availabilityRepo;
    private segmentTreeService;
    constructor(tempAvailabilityRepo: Repository<TemporaryAvailability>, queueRepo: Repository<AppointmentQueue>, appointmentRepo: Repository<Appointment>, availabilityRepo: Repository<Availability>, segmentTreeService: SegmentTreeService);
    expandAvailability(doctorId: string, date: string, newEndTime: string): Promise<{
        success: boolean;
        message: string;
        date: {
            originalEndTime: string;
            newEndTime: string;
            additionalSlots: number;
            queueEntriesProcessed: number;
        };
    }>;
    shrinkAvailability(doctorId: string, date: string, newEndTime: string): Promise<{
        success: boolean;
        message: string;
        data: {
            originalEn: string;
            newEndTime: string;
            affectedAppointments: number;
            queueEntriesCreated: number;
        };
    }>;
    private processExpansion;
    private processShrinking;
    getCurrentAvailability(doctorId: string, date: string): Promise<Availability | null>;
    private findAffectedAppointments;
    createAppointmentFromQueue(queueEntry: AppointmentQueue, appointmentTime: string): Promise<Appointment>;
    private getDayOfWeek;
    private timeToMinutes;
    private minutesToTime;
}
