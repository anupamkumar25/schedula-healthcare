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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("../entities/appointment.entity");
const appointment_queue_entity_1 = require("../entities/appointment-queue.entity");
function buildDateWhere(range) {
    if (!range)
        return undefined;
    const { from, to } = range;
    if (from && to)
        return (0, typeorm_2.Between)(from, to);
    if (from)
        return (0, typeorm_2.MoreThanOrEqual)(from);
    if (to)
        return (0, typeorm_2.LessThanOrEqual)(to);
    return undefined;
}
let AnalyticsService = class AnalyticsService {
    appointmentRepo;
    queueRepo;
    constructor(appointmentRepo, queueRepo) {
        this.appointmentRepo = appointmentRepo;
        this.queueRepo = queueRepo;
    }
    async getOverview(from, to) {
        const dateOp = buildDateWhere({ from, to });
        const totalWhere = dateOp
            ? { appointmentDate: dateOp }
            : undefined;
        const totalAppointments = await this.appointmentRepo.count({ where: totalWhere });
        const upcomingWhere = { status: appointment_entity_1.AppointmentStatus.UPCOMING };
        if (dateOp)
            upcomingWhere.appointmentDate = dateOp;
        const completedWhere = { status: appointment_entity_1.AppointmentStatus.COMPLETED };
        if (dateOp)
            completedWhere.appointmentDate = dateOp;
        const cancelledWhere = { status: appointment_entity_1.AppointmentStatus.CANCELLED };
        if (dateOp)
            cancelledWhere.appointmentDate = dateOp;
        const [upcoming, completed, cancelled] = await Promise.all([
            this.appointmentRepo.count({ where: upcomingWhere }),
            this.appointmentRepo.count({ where: completedWhere }),
            this.appointmentRepo.count({ where: cancelledWhere }),
        ]);
        const pendingWhere = { status: appointment_queue_entity_1.QueueStatus.PENDING };
        if (dateOp)
            pendingWhere.requestedDate = dateOp;
        const scheduledWhere = { status: appointment_queue_entity_1.QueueStatus.SCHEDULED };
        if (dateOp)
            scheduledWhere.requestedDate = dateOp;
        const failedWhere = { status: appointment_queue_entity_1.QueueStatus.FAILED };
        if (dateOp)
            failedWhere.requestedDate = dateOp;
        const [queuePending, queueScheduled, queueFailed] = await Promise.all([
            this.queueRepo.count({ where: pendingWhere }),
            this.queueRepo.count({ where: scheduledWhere }),
            this.queueRepo.count({ where: failedWhere }),
        ]);
        return {
            success: true,
            data: {
                totalAppointments,
                statusBreakdown: { upcoming, completed, cancelled },
                queue: { pending: queuePending, scheduled: queueScheduled, failed: queueFailed },
            },
        };
    }
    async getDoctorAnalytics(doctorId, from, to) {
        const dateOp = buildDateWhere({ from, to });
        const apptWhere = { doctorId };
        if (dateOp)
            apptWhere.appointmentDate = dateOp;
        const queueWhere = { doctorId };
        if (dateOp)
            queueWhere.requestedDate = dateOp;
        const [appointments, queue] = await Promise.all([
            this.appointmentRepo.count({ where: apptWhere }),
            this.queueRepo.count({ where: queueWhere }),
        ]);
        const completedWhere = { doctorId, status: appointment_entity_1.AppointmentStatus.COMPLETED };
        if (dateOp)
            completedWhere.appointmentDate = dateOp;
        const cancelledWhere = { doctorId, status: appointment_entity_1.AppointmentStatus.CANCELLED };
        if (dateOp)
            cancelledWhere.appointmentDate = dateOp;
        const upcomingWhere = { doctorId, status: appointment_entity_1.AppointmentStatus.UPCOMING };
        if (dateOp)
            upcomingWhere.appointmentDate = dateOp;
        const [completed, cancelled, upcoming] = await Promise.all([
            this.appointmentRepo.count({ where: completedWhere }),
            this.appointmentRepo.count({ where: cancelledWhere }),
            this.appointmentRepo.count({ where: upcomingWhere }),
        ]);
        return {
            success: true,
            data: {
                appointments,
                queue,
                statusBreakdown: { upcoming, completed, cancelled },
            },
        };
    }
    async getQueueAnalytics(from, to) {
        const dateOp = buildDateWhere({ from, to });
        const pendingWhere = { status: appointment_queue_entity_1.QueueStatus.PENDING };
        if (dateOp)
            pendingWhere.requestedDate = dateOp;
        const scheduledWhere = { status: appointment_queue_entity_1.QueueStatus.SCHEDULED };
        if (dateOp)
            scheduledWhere.requestedDate = dateOp;
        const failedWhere = { status: appointment_queue_entity_1.QueueStatus.FAILED };
        if (dateOp)
            failedWhere.requestedDate = dateOp;
        const [pending, scheduled, failed] = await Promise.all([
            this.queueRepo.count({ where: pendingWhere }),
            this.queueRepo.count({ where: scheduledWhere }),
            this.queueRepo.count({ where: failedWhere }),
        ]);
        return { success: true, data: { pending, scheduled, failed } };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(1, (0, typeorm_1.InjectRepository)(appointment_queue_entity_1.AppointmentQueue)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map