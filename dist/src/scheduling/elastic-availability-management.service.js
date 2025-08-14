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
const segment_tree_service_1 = require("./segment-tree.service");
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
    async expandAvailability(doctorId, newEndTime, date, day) {
        let targetDate;
        let targetDay;
        if (date) {
            targetDate = date;
            targetDay = this.getDayOfWeek(date);
        }
        else if (day) {
            targetDay = day.toLowerCase();
            targetDate = new Date().toISOString().split('T')[0];
        }
        else {
            throw new common_1.BadRequestException('Either date or day must be provided');
        }
        console.log(`Doctor ${doctorId} expanding availability on ${targetDate} (${targetDay}) until ${newEndTime}`);
        const currentAvailability = await this.getCurrentAvailability(doctorId, targetDate, targetDay);
        if (!currentAvailability) {
            throw new common_1.BadRequestException(`No availability found for ${day || date}`);
        }
        if (newEndTime <= currentAvailability.endTime) {
            throw new common_1.BadRequestException('New end time must be later than current end time');
        }
        let tempAvailability = await this.tempAvailabilityRepo.findOne({
            where: { doctorId, effectiveDate: targetDate },
        });
        if (tempAvailability) {
            tempAvailability.changeType = temporary_availability_entity_1.AvailabilityChangeType.EXPAND;
            tempAvailability.newEndTime = newEndTime;
        }
        else {
            tempAvailability = this.tempAvailabilityRepo.create({
                doctorId: doctorId,
                effectiveDate: targetDate,
                changeType: temporary_availability_entity_1.AvailabilityChangeType.EXPAND,
                originalStartTime: currentAvailability.startTime,
                originalEndTime: currentAvailability.endTime,
                newStartTime: currentAvailability.startTime,
                newEndTime: newEndTime,
            });
        }
        const savedTempAvailability = await this.tempAvailabilityRepo.save(tempAvailability);
        const result = await this.processExpansion(savedTempAvailability);
        return {
            success: true,
            message: 'Availability expanded successfully',
            data: {
                targetDate,
                targetDay,
                originalEndTime: currentAvailability.endTime,
                newEndTime,
                additionalSlots: result.slotsCreated,
                queueEntriesProcessed: result.appointmentScheduled,
            },
        };
    }
    async shrinkAvailability(doctorId, newEndTime, date, day) {
        let targetDate;
        let targetDay;
        if (date) {
            targetDate = date;
            targetDay = this.getDayOfWeek(date);
        }
        else if (day) {
            targetDay = day.toLowerCase();
            targetDate = new Date().toISOString().split('T')[0];
        }
        else {
            throw new common_1.BadRequestException('Either date or day must be provided');
        }
        console.log(`Doctor ${doctorId} shrinking availability on ${targetDate} (${targetDay}) until ${newEndTime}`);
        const currentAvailability = await this.getCurrentAvailability(doctorId, targetDate, targetDay);
        if (!currentAvailability) {
            throw new common_1.BadRequestException(`No availability found for ${day || date}`);
        }
        if (newEndTime >= currentAvailability.endTime) {
            throw new common_1.BadRequestException('New end time must be earlier than current end time');
        }
        const existingTemp = await this.tempAvailabilityRepo.findOne({
            where: { doctorId, effectiveDate: targetDate },
        });
        const affectedAppointments = await this.findAffectedAppointments(doctorId, targetDate, newEndTime, currentAvailability.endTime);
        if (existingTemp) {
            await this.tempAvailabilityRepo.update(existingTemp.id, {
                changeType: temporary_availability_entity_1.AvailabilityChangeType.SHRINK,
                newEndTime: newEndTime,
                affectedAppointment: affectedAppointments.map((apt) => apt.appointmentId),
            });
        }
        else {
            await this.tempAvailabilityRepo.save({
                doctorId,
                effectiveDate: targetDate,
                changeType: temporary_availability_entity_1.AvailabilityChangeType.SHRINK,
                originalStartTime: currentAvailability.startTime,
                originalEndTime: currentAvailability.endTime,
                newStartTime: currentAvailability.startTime,
                newEndTime,
                affectedAppointments: affectedAppointments.map((apt) => apt.appointmentId),
            });
        }
        const newAvailability = {
            startTime: currentAvailability.startTime,
            endTime: newEndTime,
        };
        await this.segmentTreeService.buildAndPopulateTree(doctorId, targetDate, newAvailability);
        const result = await this.processShrinking(affectedAppointments);
        return {
            success: true,
            message: 'Availability shrunk successfully',
            data: {
                targetDate,
                targetDay,
                originalEndTime: currentAvailability.endTime,
                newEndTime,
                affectedAppointments: affectedAppointments.length,
                queueEntriesCreated: result.queueEntriesCreated,
            },
        };
    }
    async processExpansion(tempAvailability) {
        const { doctorId, effectiveDate, originalEndTime, newEndTime } = tempAvailability;
        const expansionDate = new Date(effectiveDate);
        expansionDate.setDate(expansionDate.getDate() + 1);
        const nextDayStr = expansionDate.toISOString().split('T')[0];
        const queueEntries = await this.queueRepo.find({
            where: {
                doctorId,
                requestedDate: nextDayStr,
                status: appointment_queue_entity_1.QueueStatus.PENDING,
            },
        });
        if (queueEntries.length === 0) {
            console.log('No queue entries to process for expansion');
            return { slotsCreated: 0, appointmentScheduled: 0 };
        }
        const newAvailability = {
            startTime: tempAvailability.newStartTime,
            endTime: newEndTime,
        };
        await this.segmentTreeService.buildAndPopulateTree(doctorId, effectiveDate, newAvailability);
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
                await this.createAppointmentFromQueue(queueEntry, appointmentTime, effectiveDate);
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
    async processShrinking(affectedAppointment) {
        let queueEntriesCreated = 0;
        for (const appointment of affectedAppointment) {
            try {
                await this.queueRepo.save({
                    patientId: appointment.patientId,
                    doctorId: appointment.doctorId,
                    requestedDate: appointment.appointmentDate,
                    priority: appointment_queue_entity_1.QueuePriority.NORMAL,
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
    async getCurrentAvailability(doctorId, date, day) {
        console.log(`[getCurrentAvailability] Checking for temp availability for doctor ${doctorId} on date ${date}`);
        const tempAvailability = await this.tempAvailabilityRepo.findOne({
            where: { doctorId, effectiveDate: date },
        });
        if (tempAvailability) {
            console.log('[getCurrentAvailability] Found temp record:', tempAvailability);
            return {
                startTime: tempAvailability.newStartTime,
                endTime: tempAvailability.newEndTime,
            };
        }
        console.log('[getCurrentAvailability] No temp record found. Falling back to permanent schedule.');
        const dayOfWeek = day ? this.mapDayStringToEnum(day) : this.getDayOfWeek(date);
        return this.availabilityRepo.findOne({
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
    async createAppointmentFromQueue(queueEntry, appointmentTime, effectiveDate) {
        console.log('function running');
        const appointment = this.appointmentRepo.create({
            patientId: queueEntry.patientId,
            doctorId: queueEntry.doctorId,
            appointmentDate: effectiveDate,
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
        console.log('function ended');
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
    mapDayStringToEnum(day) {
        const dayMap = {
            'sunday': availability_entity_1.DayOfWeek.SUNDAY,
            'monday': availability_entity_1.DayOfWeek.MONDAY,
            'tuesday': availability_entity_1.DayOfWeek.TUESDAY,
            'wednesday': availability_entity_1.DayOfWeek.WEDNESDAY,
            'thursday': availability_entity_1.DayOfWeek.THURSDAY,
            'friday': availability_entity_1.DayOfWeek.FRIDAY,
            'saturday': availability_entity_1.DayOfWeek.SATURDAY,
        };
        const mappedDay = dayMap[day.toLowerCase()];
        if (!mappedDay) {
            throw new common_1.BadRequestException(`Invalid day: ${day}. Must be one of: sunday, monday, tuesday, wednesday, thursday, friday, saturday`);
        }
        return mappedDay;
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
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => segment_tree_service_1.SegmentTreeService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        segment_tree_service_1.SegmentTreeService])
], AvailabilityManagementService);
//# sourceMappingURL=elastic-availability-management.service.js.map