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
exports.TemporaryAvailability = exports.AvailabilityChangeType = void 0;
const typeorm_1 = require("typeorm");
var AvailabilityChangeType;
(function (AvailabilityChangeType) {
    AvailabilityChangeType["EXPAND"] = "expand";
    AvailabilityChangeType["SHRINK"] = "shrink";
})(AvailabilityChangeType || (exports.AvailabilityChangeType = AvailabilityChangeType = {}));
let TemporaryAvailability = class TemporaryAvailability {
    id;
    doctorId;
    effectiveDate;
    changeType;
    originalStartTime;
    originalEndTime;
    newStartTime;
    newEndTime;
    affectedAppointment;
    createdAt;
};
exports.TemporaryAvailability = TemporaryAvailability;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TemporaryAvailability.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], TemporaryAvailability.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", String)
], TemporaryAvailability.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AvailabilityChangeType }),
    __metadata("design:type", String)
], TemporaryAvailability.prototype, "changeType", void 0);
__decorate([
    (0, typeorm_1.Column)('time'),
    __metadata("design:type", String)
], TemporaryAvailability.prototype, "originalStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)('time'),
    __metadata("design:type", String)
], TemporaryAvailability.prototype, "originalEndTime", void 0);
__decorate([
    (0, typeorm_1.Column)('time'),
    __metadata("design:type", String)
], TemporaryAvailability.prototype, "newStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)('time'),
    __metadata("design:type", String)
], TemporaryAvailability.prototype, "newEndTime", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], TemporaryAvailability.prototype, "affectedAppointment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TemporaryAvailability.prototype, "createdAt", void 0);
exports.TemporaryAvailability = TemporaryAvailability = __decorate([
    (0, typeorm_1.Entity)('temporary-availability')
], TemporaryAvailability);
//# sourceMappingURL=temporary-availability.entity.js.map