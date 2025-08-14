import { Repository } from 'typeorm';
import { SegmentTreeService } from './segment-tree.service';
import { AppointmentQueue } from './entities/appointment-queue.entity';
import { Availability } from './entities/availability.entity';
import { MlPredictionService } from 'ml/ml-predictions/ml-prediction.service';
import { AvailabilityManagementService } from './availability/elastic-availability-management.service';
import { AvailabilityService } from './availability/availability.service';
export declare class QueueProcessorService {
    private queueRepo;
    private availabilityRepo;
    private segmentTreeService;
    private mlPredictionService;
    private availabilityManagementRepo;
    private availabilityService;
    constructor(queueRepo: Repository<AppointmentQueue>, availabilityRepo: Repository<Availability>, segmentTreeService: SegmentTreeService, mlPredictionService: MlPredictionService, availabilityManagementRepo: AvailabilityManagementService, availabilityService: AvailabilityService);
    processNightQueue(): Promise<void>;
    private processDoctorQueue;
    private getPredictedDuration;
    private getDayOfWeek;
    private minutesToTime;
}
