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
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const appointments_service_1 = require("./appointments.service");
const jwt_auth_guard_1 = require("../auth/guard/jwt-auth.guard");
const create_appointment_dto_1 = require("./create-appointment.dto");
let AppointmentsController = class AppointmentsController {
    appointmentsService;
    constructor(appointmentsService) {
        this.appointmentsService = appointmentsService;
    }
    validateAppointmentId(appointmentId) {
        if (!appointmentId || appointmentId === 'null' || appointmentId === 'undefined') {
            throw new common_1.BadRequestException('Invalid appointment ID provided');
        }
    }
    async createAppointment(req, createAppointmentDto) {
        const patientId = req.user.userId;
        return this.appointmentsService.createAppointment(patientId, createAppointmentDto);
    }
    async getPatientAppointments(req) {
        const patientId = req.user.userId;
        return this.appointmentsService.getPatientAppointments(patientId);
    }
    async getDoctorAppointments(req) {
        const doctorId = req.user.userId;
        return this.appointmentsService.getDoctorAppointments(doctorId);
    }
    async getAppointmentById(appointmentId) {
        this.validateAppointmentId(appointmentId);
        return this.appointmentsService.getAppointmentsById(appointmentId);
    }
    async getAppointmentFromQueue(queueId) {
        return this.appointmentsService.getAppointmentFromQueue(queueId);
    }
    async cancelAppointment(req, appointmentId) {
        this.validateAppointmentId(appointmentId);
        const userId = req.user.userId;
        return this.appointmentsService.cancelAppointment(appointmentId, userId);
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_appointment_dto_1.CreateAppointmentDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "createAppointment", null);
__decorate([
    (0, common_1.Get)('patient'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getPatientAppointments", null);
__decorate([
    (0, common_1.Get)('doctor'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getDoctorAppointments", null);
__decorate([
    (0, common_1.Get)(':appointmentId'),
    __param(0, (0, common_1.Param)('appointmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getAppointmentById", null);
__decorate([
    (0, common_1.Get)('queue/:queueId'),
    __param(0, (0, common_1.Param)('queueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getAppointmentFromQueue", null);
__decorate([
    (0, common_1.Put)(':appointmentId/cancel'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('appointmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "cancelAppointment", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, common_1.Controller)('Appointments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map