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
exports.AvailabilityManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const temporary_availability_entity_1 = require("../entities/temporary-availability.entity");
const appointment_queue_entity_1 = require("../entities/appointment-queue.entity");
const appointment_entity_1 = require("../entities/appointment.entity");
const availability_entity_1 = require("../entities/availability.entity");
const segment_tree_service_1 = require("../segment-tree.service");
let AvailabilityManagementService = class AvailabilityManagementService {
    tempAvailabilityRepo;
    queueRepo;
    appointmentRepo;
    availabilityRepo;
    segmentTreeService;
    constructor(tempAvailabilityRepo, queueRepo, appointmentRepo, availabilityRepo, segmentTreeService) {
        this.tempAvailabilityRepo = tempAvailabilityRepo;
        this.queueRepo = queueRepo;
        this.appointmentRepo = appointmentRepo;
        this.availabilityRepo = availabilityRepo;
        this.segmentTreeService = segmentTreeService;
    }
    async expandAvailability(doctorId, date, newEndTime) {
        console.log(`Doctor ${doctorId} expanding availability on ${date} until ${newEndTime}`);
        const currentAvailability = await this.getCurrentAvailability(doctorId, date);
        if (!currentAvailability) {
            throw new common_1.BadRequestException('No availability found for this date');
        }
        if (newEndTime <= currentAvailability.endTime) {
            throw new common_1.BadRequestException('New end time must be later than current end time');
        }
        const tempAvailability = await this.tempAvailabilityRepo.save({
            doctorId: doctorId,
            effectiveDate: date,
            changeType: temporary_availability_entity_1.AvailabilityChangeType.EXPAND,
            originalStartTime: currentAvailability.startTime,
            originalEndTime: currentAvailability.endTime,
            newStartTime: currentAvailability.startTime,
            newEndTime: newEndTime,
            affectedAppointments: [],
        });
        const result = await this.processExpansion(tempAvailability);
        return {
            success: true,
            message: 'AAvailability expanded successfully',
            date: {
                originalEndTime: currentAvailability.endTime,
                newEndTime,
                additionalSlots: result.slotsCreated,
                queueEntriesProcessed: result.appointmentScheduled,
            },
        };
    }
    async shrinkAvailability(doctorId, date, newEndTime) {
        console.log(`Doctor ${doctorId} shrinking availability on ${date} until ${newEndTime}`);
        const currentAvailability = await this.getCurrentAvailability(doctorId, date);
        if (!currentAvailability) {
            throw new common_1.BadRequestException('No availability found for this date');
        }
        if (newEndTime >= currentAvailability.endTime) {
            throw new common_1.BadRequestException('New end time must be earlier than current end time');
        }
        const affectedAppointments = await this.findAffectedAppointments(doctorId, date, newEndTime, currentAvailability.endTime);
        const tempAvailability = await this.tempAvailabilityRepo.save({
            doctorId,
            effectiveDate: date,
            changeType: temporary_availability_entity_1.AvailabilityChangeType.SHRINK,
            originalStartTime: currentAvailability.startTime,
            originalEndTime: currentAvailability.endTime,
            newStartTime: currentAvailability.startTime,
            newEndTime,
            affectedAppointments: affectedAppointments.map((apt) => apt.appointmentId),
        });
        const result = await this.processShrinking(tempAvailability, affectedAppointments);
        return {
            success: true,
            message: 'Availability shrunk successfully',
            data: {
                originalEn: currentAvailability.endTime,
                newEndTime,
                affectedAppointments: affectedAppointments.length,
                queueEntriesCreated: result.queueEntriesCreated,
            },
        };
    }
    async processExpansion(tempAvailability) {
        const { doctorId, effectiveDate, originalEndTime, newEndTime } = tempAvailability;
        const queueEntries = await this.queueRepo.find({
            where: {
                doctorId,
                requestedDate: effectiveDate,
                status: appointment_queue_entity_1.QueueStatus.PENDING,
            },
        });
        if (queueEntries.length === 0) {
            console.log('No queue entries to process for expansion');
            return { slotsCreated: 0, appointmentScheduled: 0 };
        }
        this.segmentTreeService.addSlots(doctorId, effectiveDate, originalEndTime, newEndTime);
        let appointmentScheduled = 0;
        const expandedDurationMinutes = this.timeToMinutes(newEndTime) - this.timeToMinutes(originalEndTime);
        const availabilitySlots = Math.floor(expandedDurationMinutes / 17);
        console.log(`Processing ${queueEntries.length} queue entries for ${availabilitySlots} new slots`);
        for (const queueEntry of queueEntries) {
            if (appointmentScheduled >= availabilitySlots)
                break;
            try {
                const optimalStartMinutes = this.segmentTreeService.findOptimalSlot(doctorId, effectiveDate, 17);
                if (optimalStartMinutes === null) {
                    console.log('No more optimal slots available');
                    break;
                }
                const appointmentTime = this.minutesToTime(optimalStartMinutes);
                await this.createAppointmentFromQueue(queueEntry, appointmentTime);
                this.segmentTreeService.bookSlot(doctorId, effectiveDate, optimalStartMinutes, optimalStartMinutes + 17);
                await this.queueRepo.update(queueEntry.queueId, {
                    status: appointment_queue_entity_1.QueueStatus.SCHEDULED,
                });
                console.log(`Scheduled queue entry: ${appointmentTime} for patient ${queueEntry.patientId}`);
                appointmentScheduled++;
            }
            catch (error) {
                console.error(`Failed to schedule queue entry ${queueEntry.queueId}:`, error);
            }
        }
        return { slotsCreated: availabilitySlots, appointmentScheduled };
    }
    async processShrinking(tempAvailability, affectedAppointment) {
        let queueEntriesCreated = 0;
        for (const appointment of affectedAppointment) {
            try {
                await this.queueRepo.save({
                    patientId: appointment.doctorId,
                    doctorId: appointment.doctorId,
                    requestedDate: appointment.appointmentDate,
                    priority: appointment_queue_entity_1.QueuePriority.HIGH,
                    status: appointment_queue_entity_1.QueueStatus.PENDING,
                    originalAppointmentId: appointment.appointmentId,
                });
                await this.appointmentRepo.update(appointment.appointmentId, {
                    status: appointment_entity_1.AppointmentStatus.CANCELLED,
                });
                queueEntriesCreated++;
                console.log(`Moved appointment to queue: Patient ${appointment.patientId} `);
            }
            catch (error) {
                console.error(`Failed to move appointment to queue:`, error);
            }
        }
        return { queueEntriesCreated };
    }
    async getCurrentAvailability(doctorId, date) {
        const dayOfWeek = this.getDayOfWeek(date);
        return await this.availabilityRepo.findOne({
            where: { doctorId, day: dayOfWeek, isActive: true },
        });
    }
    async findAffectedAppointments(doctorId, date, newEndTime, originalEndTime) {
        return await this.appointmentRepo.find({
            where: {
                doctorId,
                appointmentDate: date,
                appointmentTime: (0, typeorm_2.Between)(newEndTime, originalEndTime),
                status: appointment_entity_1.AppointmentStatus.UPCOMING,
            },
        });
    }
    async createAppointmentFromQueue(queueEntry, appointmentTime) {
        const appointment = this.appointmentRepo.create({
            patientId: queueEntry.patientId,
            doctorId: queueEntry.doctorId,
            appointmentDate: queueEntry.requestedDate,
            appointmentTime,
            type: queueEntry.type,
            duration: 17,
            status: appointment_entity_1.AppointmentStatus.UPCOMING,
            tokenNumber: `Q${Date.now().toString().slice(-6)}`,
        });
        const savedAppointment = await this.appointmentRepo.save(appointment);
        await this.queueRepo.update(queueEntry.queueId, {
            originalAppointmentId: savedAppointment.appointmentId,
            status: appointment_queue_entity_1.QueueStatus.SCHEDULED,
        });
        return savedAppointment;
    }
    getDayOfWeek(date) {
        const days = [
            availability_entity_1.DayOfWeek.SUNDAY,
            availability_entity_1.DayOfWeek.MONDAY,
            availability_entity_1.DayOfWeek.TUESDAY,
            availability_entity_1.DayOfWeek.WEDNESDAY,
            availability_entity_1.DayOfWeek.THURSDAY,
            availability_entity_1.DayOfWeek.FRIDAY,
            availability_entity_1.DayOfWeek.SATURDAY,
        ];
        return days[new Date(date).getDay()];
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
};
exports.AvailabilityManagementService = AvailabilityManagementService;
exports.AvailabilityManagementService = AvailabilityManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(temporary_availability_entity_1.TemporaryAvailability)),
    __param(1, (0, typeorm_1.InjectRepository)(appointment_queue_entity_1.AppointmentQueue)),
    __param(2, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(3, (0, typeorm_1.InjectRepository)(availability_entity_1.Availability)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        segment_tree_service_1.SegmentTreeService])
], AvailabilityManagementService);
//# sourceMappingURL=elastic-availability-management.service.js.map