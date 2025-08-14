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
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const availability_entity_1 = require("../entities/availability.entity");
const doctor_entity_1 = require("../entities/doctor.entity");
let AvailabilityService = class AvailabilityService {
    availabilityRepository;
    doctorRepository;
    constructor(availabilityRepository, doctorRepository) {
        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
    }
    async validateDoctorId(doctorId) {
        if (!doctorId || doctorId === 'null' || doctorId === 'undefined') {
            throw new common_1.BadRequestException('Invalid doctor ID provided');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(doctorId)) {
            throw new common_1.BadRequestException('Invalid doctor ID format');
        }
        const doctor = await this.doctorRepository.findOne({
            where: { doctorId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor not found');
        }
    }
    async createAvailability(doctorId, createAvailabilityDto) {
        const { day, startTime, endTime, isActive } = createAvailabilityDto;
        await this.validateDoctorId(doctorId);
        const existingAvailability = await this.availabilityRepository.findOne({
            where: { doctorId, day },
        });
        if (existingAvailability) {
            throw new common_1.ConflictException(`Availability already exists for ${day}`);
        }
        if (startTime >= endTime) {
            throw new common_1.ConflictException('Start time must be before end time');
        }
        const availability = this.availabilityRepository.create({
            doctorId,
            day,
            startTime,
            endTime,
            isActive: isActive ?? true,
        });
        const savedAvailability = await this.availabilityRepository.save(availability);
        return {
            success: true,
            message: 'Availability created successfully',
            data: savedAvailability,
        };
    }
    async getDoctorAvailabilities(doctorId) {
        await this.validateDoctorId(doctorId);
        const availabilities = await this.availabilityRepository.find({
            where: { doctorId, isActive: true },
            order: { day: 'ASC' },
        });
        return {
            success: true,
            data: availabilities,
        };
    }
    async updateAvailability(doctorId, availabilityId, updateData) {
        await this.validateDoctorId(doctorId);
        if (!availabilityId || availabilityId === 'null' || availabilityId === '') {
            throw new common_1.BadRequestException('Invalid availability ID provided');
        }
        const availability = await this.availabilityRepository.findOne({
            where: { availabilityId, doctorId },
        });
        if (!availability) {
            throw new common_1.NotFoundException('Availability not found');
        }
        if (updateData.startTime || updateData.endTime) {
            const startTime = updateData.startTime || availability.startTime;
            const endTime = updateData.endTime || availability.endTime;
            if (startTime >= endTime) {
                throw new common_1.ConflictException('Start time must be before end time');
            }
            Object.assign(availability, updateData);
            const updatedAvailability = await this.availabilityRepository.save(availability);
            return {
                success: true,
                message: 'Availability updated successfully',
                data: updatedAvailability,
            };
        }
    }
    async deleteAvailability(doctorId, availabilityId) {
        await this.validateDoctorId(doctorId);
        if (!availabilityId || availabilityId === 'null' || availabilityId === '') {
            throw new common_1.BadRequestException('Invalid availability ID provided');
        }
        const availability = await this.availabilityRepository.findOne({
            where: { availabilityId, doctorId },
        });
        if (!availability) {
            throw new common_1.NotFoundException('Availability not found');
        }
        await this.availabilityRepository.remove(availability);
        return {
            success: true,
            message: 'Availability deleted successfully',
        };
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(availability_entity_1.Availability)),
    __param(1, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map