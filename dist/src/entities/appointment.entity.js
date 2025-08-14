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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointment = exports.AppointmentType = exports.AppointmentStatus = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("./patient.entity");
const doctor_entity_1 = require("./doctor.entity");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["UPCOMING"] = "upcoming";
    AppointmentStatus["COMPLETED"] = "completed";
    AppointmentStatus["CANCELLED"] = "cancelled";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var AppointmentType;
(function (AppointmentType) {
    AppointmentType["ROUTINE"] = "routine";
    AppointmentType["FOLLOWUP"] = "follow-up";
    AppointmentType["NEWPATIENT"] = "new-patient";
    AppointmentType["EMERGENCY"] = "emergency";
})(AppointmentType || (exports.AppointmentType = AppointmentType = {}));
let Appointment = class Appointment {
    appointmentId;
    doctorId;
    patientId;
    appointmentDate;
    appointmentTime;
    actualStartTime;
    actualEndTime;
    duration;
    tokenNumber;
    status;
    type;
    complaint;
    createdAt;
    updatedAt;
    doctor;
    patient;
};
exports.Appointment = Appointment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Appointment.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.Column)('string'),
    __metadata("design:type", String)
], Appointment.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.Column)('string'),
    __metadata("design:type", String)
], Appointment.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Appointment.prototype, "appointmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], Appointment.prototype, "appointmentTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "actualStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "actualEndTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 30 }),
    __metadata("design:type", Number)
], Appointment.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], Appointment.prototype, "tokenNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.UPCOMING,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AppointmentType,
        default: AppointmentType.NEWPATIENT,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "complaint", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Appointment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Appointment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => doctor_entity_1.Doctor, (doctor) => doctor.appointments),
    (0, typeorm_1.JoinColumn)({ name: 'doctorId' }),
    __metadata("design:type", doctor_entity_1.Doctor)
], Appointment.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, (patient) => patient.appointments),
    (0, typeorm_1.JoinColumn)({ name: 'patientId' }),
    __metadata("design:type", patient_entity_1.Patient)
], Appointment.prototype, "patient", void 0);
exports.Appointment = Appointment = __decorate([
    (0, typeorm_1.Entity)('Appointments')
], Appointment);
//# sourceMappingURL=appointment.entity.js.map