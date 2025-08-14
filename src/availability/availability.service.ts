import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from '../entities/availability.entity';
import { Doctor } from '../entities/doctor.entity';
import { CreateAvailabilityDto } from './create-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  private async validateDoctorId(doctorId: string): Promise<void> {
    // Validate doctorId is not null, undefined, or "null" string
    if (!doctorId || doctorId === 'null' || doctorId === 'undefined') {
      throw new BadRequestException('Invalid doctor ID provided');
    }

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(doctorId)) {
      throw new BadRequestException('Invalid doctor ID format');
    }

    // Check if doctor exists
    const doctor = await this.doctorRepository.findOne({
      where: { doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
  }

  async createAvailability(
    doctorId: string,
    createAvailabilityDto: CreateAvailabilityDto,
  ) {
    const { day, startTime, endTime, isActive } = createAvailabilityDto;

    await this.validateDoctorId(doctorId);

    const existingAvailability = await this.availabilityRepository.findOne({
      where: { doctorId, day },
    });

    if (existingAvailability) {
      throw new ConflictException(`Availability already exists for ${day}`);
    }

    if (startTime >= endTime) {
      throw new ConflictException('Start time must be before end time');
    }

    const availability = this.availabilityRepository.create({
      doctorId,
      day,
      startTime,
      endTime,
      isActive: isActive ?? true,
    });

    const savedAvailability =
      await this.availabilityRepository.save(availability);

    return {
      success: true,
      message: 'Availability created successfully',
      data: savedAvailability,
    };
  }

  async getDoctorAvailabilities(doctorId: string) {
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

  async updateAvailability(
    doctorId: string,
    availabilityId: string,
    updateData: Partial<CreateAvailabilityDto>,
  ) {
    await this.validateDoctorId(doctorId);

    // Validate availabilityId is a proper UUID
    if (!availabilityId || availabilityId === 'null' || availabilityId === '') {
      throw new BadRequestException('Invalid availability ID provided');
    }

    const availability = await this.availabilityRepository.findOne({
      where: { availabilityId, doctorId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (updateData.startTime || updateData.endTime) {
      const startTime = updateData.startTime || availability.startTime;
      const endTime = updateData.endTime || availability.endTime;

      if (startTime >= endTime) {
        throw new ConflictException('Start time must be before end time');
      }

      Object.assign(availability, updateData);

      const updatedAvailability =
        await this.availabilityRepository.save(availability);

      return {
        success: true,
        message: 'Availability updated successfully',
        data: updatedAvailability,
      };
    }
  }

  async deleteAvailability(doctorId: string, availabilityId: string) {
    await this.validateDoctorId(doctorId);

    // Validate availabilityId is a proper UUID
    if (!availabilityId || availabilityId === 'null' || availabilityId === '') {
      throw new BadRequestException('Invalid availability ID provided');
    }

    const availability = await this.availabilityRepository.findOne({
      where: { availabilityId, doctorId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    await this.availabilityRepository.remove(availability);

    return {
      success: true,
      message: 'Availability deleted successfully',
    };
  }
}
