"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueProcessorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const segment_tree_service_1 = require("./segment-tree.service");
const appointment_queue_entity_1 = require("./entities/appointment-queue.entity");
const availability_entity_1 = require("./entities/availability.entity");
const ml_prediction_service_1 = require("../ml/ml-predictions/ml-prediction.service");
const elastic_availability_management_service_1 = require("./availability/elastic-availability-management.service");
const availability_service_1 = require("./availability/availability.service");
let QueueProcessorService = class QueueProcessorService {
    queueRepo;
    availabilityRepo;
    segmentTreeService;
    mlPredictionService;
    availabilityManagementRepo;
    availabilityService;
    constructor(queueRepo, availabilityRepo, segmentTreeService, mlPredictionService, availabilityManagementRepo, availabilityService) {
        this.queueRepo = queueRepo;
        this.availabilityRepo = availabilityRepo;
        this.segmentTreeService = segmentTreeService;
        this.mlPredictionService = mlPredictionService;
        this.availabilityManagementRepo = availabilityManagementRepo;
        this.availabilityService = availabilityService;
    }
    async processNightQueue() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        console.log(`Starting night queue processing for ${tomorrowStr}`);
        const doctorsWithQueue = await this.queueRepo
            .createQueryBuilder('queue')
            .select('DISTINCT queue.doctorId')
            .where('queue.requestedDate = :date', { date: tomorrowStr })
            .andWhere('queue.status = :status', { status: appointment_queue_entity_1.QueueStatus.PENDING })
            .getRawMany();
        for (const { queue_doctorId: doctorId } of doctorsWithQueue) {
            await this.processDoctorQueue(doctorId, tomorrowStr);
        }
        console.log(`Night queue processing completed for ${tomorrowStr}`);
    }
    async processDoctorQueue(doctorId, date) {
        console.log(`Processing queue for doctor ${doctorId} on ${date}`);
        const availability = await this.availabilityManagementRepo.getCurrentAvailability(doctorId, date);
        if (!availability) {
            console.log(`No availability found for doctor ${doctorId} on ${date}`);
            return;
        }
        this.segmentTreeService.initializeDayTree(doctorId, date, availability.startTime, availability.endTime);
        const queueEntries = await this.queueRepo.find({
            where: {
                doctorId,
                requestedDate: date,
                status: appointment_queue_entity_1.QueueStatus.PENDING,
            },
            relations: ['patient'],
            order: { priority: 'ASC', createdAt: 'ASC' },
        });
        console.log(`Found ${queueEntries.length} queue entries to process`);
        for (const queueEntry of queueEntries) {
            try {
                const predictedDuration = await this.getPredictedDuration(queueEntry);
                const optimalStartMinutes = this.segmentTreeService.findOptimalSlot(doctorId, date, predictedDuration);
                if (optimalStartMinutes === null) {
                    console.log(`No available slot for ${predictedDuration}min appointment`);
                    await this.queueRepo.update(queueEntry.queueId, {
                        status: appointment_queue_entity_1.QueueStatus.FAILED,
                    });
                    continue;
                }
                const appointmentTime = this.minutesToTime(optimalStartMinutes);
                await this.availabilityManagementRepo.createAppointmentFromQueue(queueEntry, appointmentTime);
                this.segmentTreeService.bookSlot(doctorId, date, optimalStartMinutes, optimalStartMinutes + predictedDuration);
                await this.queueRepo.update(queueEntry.queueId, {
                    status: appointment_queue_entity_1.QueueStatus.SCHEDULED,
                });
                console.log(`✅ Scheduled: ${appointmentTime} (${predictedDuration}min) for patient ${queueEntry.patientId}`);
            }
            catch (error) {
                console.error(`Failed to process queue entry ${queueEntry.queueId}:`, error);
                await this.queueRepo.update(queueEntry.queueId, {
                    status: appointment_queue_entity_1.QueueStatus.FAILED,
                });
            }
        }
    }
    async getPredictedDuration(queueEntry) {
        try {
            const prediction = await this.mlPredictionService.predictAppointmentDuration({
                doctorSpecialty: 'General',
                patientAge: 35,
                appointmentType: queueEntry.type,
                timeOfDay: 'morning',
                dayOfWeek: this.getDayOfWeek(queueEntry.requestedDate),
                patientHistoryVisits: 1,
            });
            return prediction.success ? prediction.predictedDuration : 17;
        }
        catch (error) {
            console.error('ML prediction failed, using default duration:', error);
            return 17;
        }
    }
    getDayOfWeek(date) {
        const days = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
        ];
        return days[new Date(date).getDay()];
    }
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
};
exports.QueueProcessorService = QueueProcessorService;
__decorate([
    (0, schedule_1.Cron)('0 23 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueueProcessorService.prototype, "processNightQueue", null);
exports.QueueProcessorService = QueueProcessorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_queue_entity_1.AppointmentQueue)),
    __param(1, (0, typeorm_1.InjectRepository)(availability_entity_1.Availability)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        segment_tree_service_1.SegmentTreeService,
        ml_prediction_service_1.MlPredictionService,
        elastic_availability_management_service_1.AvailabilityManagementService,
        availability_service_1.AvailabilityService])
], QueueProcessorService);
//# sourceMappingURL=night-queue-processor.service.js.map