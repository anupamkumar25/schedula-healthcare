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
exports.AvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const availability_service_1 = require("./availability.service");
const create_availability_dto_1 = require("./create-availability.dto");
const jwt_auth_guard_1 = require("../auth/guard/jwt-auth.guard");
let AvailabilityController = class AvailabilityController {
    availabilityService;
    constructor(availabilityService) {
        this.availabilityService = availabilityService;
    }
    async createAvailability(req, createAvailabilityDto) {
        const doctorId = req.user.userId;
        return this.availabilityService.createAvailability(doctorId, createAvailabilityDto);
    }
    async getDoctorAvailabilities(req) {
        const doctorId = req.user.userId;
        return this.availabilityService.getDoctorAvailabilities(doctorId);
    }
    async getSpecificDoctorAvailabilities(doctorId) {
        return this.availabilityService.getDoctorAvailabilities(doctorId);
    }
    async updateAvailability(req, availabilityId, updateData) {
        const doctorId = req.user.userId;
        return this.availabilityService.updateAvailability(doctorId, availabilityId, updateData);
    }
    async deleteAvailability(req, availabilityId) {
        const doctorId = req.user.userId;
        return this.availabilityService.deleteAvailability(doctorId, availabilityId);
    }
};
exports.AvailabilityController = AvailabilityController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_availability_dto_1.CreateAvailabilityDto]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "createAvailability", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getDoctorAvailabilities", null);
__decorate([
    (0, common_1.Get)('doctor/:doctorId'),
    __param(0, (0, common_1.Param)('doctorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getSpecificDoctorAvailabilities", null);
__decorate([
    (0, common_1.Put)(':availabilityId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('availabilityId')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "updateAvailability", null);
__decorate([
    (0, common_1.Delete)(':availabilityId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('availabilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "deleteAvailability", null);
exports.AvailabilityController = AvailabilityController = __decorate([
    (0, common_1.Controller)('availability'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [availability_service_1.AvailabilityService])
], AvailabilityController);
//# sourceMappingURL=availability.controller.js.map