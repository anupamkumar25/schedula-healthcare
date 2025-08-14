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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("../entities/appointment.entity");
const availability_entity_1 = require("../entities/availability.entity");
const doctor_entity_1 = require("../entities/doctor.entity");
const patient_entity_1 = require("../entities/patient.entity");
const appointment_queue_entity_1 = require("../entities/appointment-queue.entity");
let AppointmentsService = class AppointmentsService {
    appointmentRepository;
    availabilityRepository;
    doctorRepository;
    patientRepository;
    queueRepo;
    constructor(appointmentRepository, availabilityRepository, doctorRepository, patientRepository, queueRepo) {
        this.appointmentRepository = appointmentRepository;
        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.queueRepo = queueRepo;
    }
    validateAppointmentId(appointmentId) {
        if (!appointmentId || appointmentId === 'null' || appointmentId === 'undefined') {
            throw new common_1.BadRequestException('Invalid appointment ID provided');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(appointmentId)) {
            throw new common_1.BadRequestException('Invalid appointment ID format');
        }
    }
    async createAppointment(patientId, createAppointmentDto) {
        const { doctorId, appointmentDate, appointmentTime, type } = createAppointmentDto;
        const doctor = await this.doctorRepository.findOne({ where: { doctorId } });
        const patient = await this.patientRepository.findOne({
            where: { patientId },
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        const queueEntry = this.queueRepo.create({
            patientId,
            doctorId,
            requestedDate: appointmentDate,
            preferredTime: appointmentTime,
            type: type || appointment_entity_1.AppointmentType.NEWPATIENT,
            priority: 1,
            status: appointment_queue_entity_1.QueueStatus.PENDING,
        });
        const result = await this.queueRepo.save(queueEntry);
        return {
            success: true,
            message: 'Your request has been added to the scheduling queue. You will be notified once your appointment is scheduled.',
            ...result,
            queueId: result.queueId,
            note: 'The appointmentId will be available once your request is processed and scheduled.',
        };
    }
    async getPatientAppointments(patientId) {
        const appointments = await this.appointmentRepository.find({
            where: { patientId },
            relations: ['doctor'],
            order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
        });
        return {
            success: true,
            data: appointments,
        };
    }
    async createAppointmentFromQueue(patientId, doctorId, appointmentDate, appointmentTime, appointmentType, predictedDuration) {
        const appointment = this.appointmentRepository.create({
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            type: appointmentType,
            duration: predictedDuration,
            status: appointment_entity_1.AppointmentStatus.UPCOMING,
            tokenNumber: await this.generateTokenNumber(doctorId, appointmentDate),
            actualEndTime: this.addMinutesToTime(appointmentTime, predictedDuration),
        });
        return await this.appointmentRepository.save(appointment);
    }
    async getDoctorAppointments(doctorId) {
        const appointments = await this.appointmentRepository.find({
            where: { doctorId },
            relations: ['patient'],
            order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
        });
        return {
            success: true,
            data: appointments,
        };
    }
    async getAppointmentsById(appointmentId) {
        this.validateAppointmentId(appointmentId);
        const appointment = await this.appointmentRepository.findOne({
            where: { appointmentId },
            relations: ['doctor', 'patient'],
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        return {
            success: true,
            data: appointment,
        };
    }
    async getAppointmentFromQueue(queueId) {
        if (!queueId || queueId === 'null' || queueId === 'undefined') {
            throw new common_1.BadRequestException('Invalid queue ID provided');
        }
        const queueEntry = await this.queueRepo.findOne({
            where: { queueId },
        });
        if (!queueEntry) {
            throw new common_1.NotFoundException('Queue entry not found');
        }
        if (queueEntry.originalAppointmentId) {
            const appointment = await this.appointmentRepository.findOne({
                where: { appointmentId: queueEntry.originalAppointmentId },
                relations: ['doctor', 'patient'],
            });
            if (appointment) {
                return {
                    success: true,
                    data: appointment,
                    queueStatus: queueEntry.status,
                };
            }
        }
        return {
            success: true,
            data: queueEntry,
            message: 'Appointment is still in queue and will be scheduled soon.',
        };
    }
    async cancelAppointment(appointmentId, userId) {
        this.validateAppointmentId(appointmentId);
        const appointment = await this.appointmentRepository.findOne({
            where: { appointmentId },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.patientId !== userId && appointment.doctorId !== userId) {
            throw new common_1.BadRequestException('You are not authorized to cancel this appointment');
        }
        appointment.status = appointment_entity_1.AppointmentStatus.CANCELLED;
        const updatedAppointment = await this.appointmentRepository.save(appointment);
        return {
            success: true,
            message: 'Appointment cancelled successfully',
            data: updatedAppointment,
        };
    }
    getDayOfWeek(date) {
        const dayNames = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
        ];
        const dayIndex = new Date(date).getDay();
        return dayNames[dayIndex];
    }
    async generateTokenNumber(doctorId, appointmentDate) {
        const appointmentCount = await this.appointmentRepository.count({
            where: { doctorId, appointmentDate },
        });
        return `${doctorId.slice(0, 4).toUpperCase()}-${appointmentDate.replace(/-/g, '')}-${(appointmentCount + 1).toString().padStart(3, '0')}`;
    }
    getStartAndEndDate(appointmentDate, appointmentTime, duration = 30) {
        const [hour, minute] = appointmentTime.split(':').map(Number);
        const start = new Date(appointmentDate);
        start.setHours(hour, minute, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + duration);
        const formatTime = (date) => {
            const h = date.getHours().toString().padStart(2, '0');
            const m = date.getMinutes().toString().padStart(2, '0');
            return `${h}:${m}`;
        };
        return {
            startTime: formatTime(start),
            endTime: formatTime(end),
        };
    }
    getTimeOfDay(appointmentTime) {
        const hour = parseInt(appointmentTime.split(':')[0]);
        if (hour < 12)
            return 'morning';
        if (hour < 17)
            return 'afternoon';
        return 'evening';
    }
    calculateAge(dateOfBirth) {
        if (!dateOfBirth)
            return 35;
        const birth = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
    async getPatientVisitCount(patientId) {
        try {
            const completedVisits = await this.appointmentRepository.count({
                where: {
                    patientId,
                    status: appointment_entity_1.AppointmentStatus.COMPLETED,
                },
            });
            return completedVisits;
        }
        catch (err) {
            console.error('Error counting patient visits:', err);
            return 1;
        }
    }
    addMinutesToTime(time, minutes) {
        const [h, m] = time.split(':').map(Number);
        const t = h * 60 + m + minutes;
        const nh = Math.floor(t / 60);
        const nm = t % 60;
        return `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}`;
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(1, (0, typeorm_1.InjectRepository)(availability_entity_1.Availability)),
    __param(2, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __param(3, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(4, (0, typeorm_1.InjectRepository)(appointment_queue_entity_1.AppointmentQueue)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map