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
exports.AppointmentQueue = exports.QueuePriority = exports.QueueStatus = void 0;
const typeorm_1 = require("typeorm");
const appointment_entity_1 = require("./appointment.entity");
var QueueStatus;
(function (QueueStatus) {
    QueueStatus["PENDING"] = "pending";
    QueueStatus["PROCESSING"] = "processing";
    QueueStatus["SCHEDULED"] = "scheduled";
    QueueStatus["FAILED"] = "failed";
})(QueueStatus || (exports.QueueStatus = QueueStatus = {}));
var QueuePriority;
(function (QueuePriority) {
    QueuePriority[QueuePriority["HIGH"] = 1] = "HIGH";
    QueuePriority[QueuePriority["NORMAL"] = 2] = "NORMAL";
})(QueuePriority || (exports.QueuePriority = QueuePriority = {}));
let AppointmentQueue = class AppointmentQueue {
    queueId;
    patientId;
    doctorId;
    requestedDate;
    preferredTime;
    type;
    priority;
    status;
    originalAppointmentId;
    createdAt;
};
exports.AppointmentQueue = AppointmentQueue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AppointmentQueue.prototype, "queueId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], AppointmentQueue.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], AppointmentQueue.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", String)
], AppointmentQueue.prototype, "requestedDate", void 0);
__decorate([
    (0, typeorm_1.Column)('time', { nullable: true }),
    __metadata("design:type", String)
], AppointmentQueue.prototype, "preferredTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: appointment_entity_1.AppointmentType,
        default: appointment_entity_1.AppointmentType.NEWPATIENT,
    }),
    __metadata("design:type", String)
], AppointmentQueue.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: QueuePriority, default: QueuePriority.NORMAL }),
    __metadata("design:type", Number)
], AppointmentQueue.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: QueueStatus, default: QueueStatus.PENDING }),
    __metadata("design:type", String)
], AppointmentQueue.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], AppointmentQueue.prototype, "originalAppointmentId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AppointmentQueue.prototype, "createdAt", void 0);
exports.AppointmentQueue = AppointmentQueue = __decorate([
    (0, typeorm_1.Entity)('appointment-queue')
], AppointmentQueue);
//# sourceMappingURL=appointment-queue.entity.js.map