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
exports.QueueAppointmentDDto = exports.FlexibilityType = void 0;
const class_validator_1 = require("class-validator");
var FlexibilityType;
(function (FlexibilityType) {
    FlexibilityType["FLEXIBLE"] = "flexible";
    FlexibilityType["MODERATE"] = "moderate";
    FlexibilityType["STRICT"] = "strict";
})(FlexibilityType || (exports.FlexibilityType = FlexibilityType = {}));
class QueueAppointmentDDto {
    doctorId;
    requestedDate;
    preferredTime;
    flexibility;
    appointmentType;
    complaint;
}
exports.QueueAppointmentDDto = QueueAppointmentDDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueueAppointmentDDto.prototype, "doctorId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Date must be in YYYY-MM-DD format',
    }),
    __metadata("design:type", String)
], QueueAppointmentDDto.prototype, "requestedDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Time must be in HH:MM format',
    }),
    __metadata("design:type", String)
], QueueAppointmentDDto.prototype, "preferredTime", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FlexibilityType),
    __metadata("design:type", String)
], QueueAppointmentDDto.prototype, "flexibility", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QueueAppointmentDDto.prototype, "appointmentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueueAppointmentDDto.prototype, "complaint", void 0);
//# sourceMappingURL=queue-appointment.dto.js.map