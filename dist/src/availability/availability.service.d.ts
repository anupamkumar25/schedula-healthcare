import { Repository } from 'typeorm';
import { Availability } from '../entities/availability.entity';
import { Doctor } from '../entities/doctor.entity';
import { CreateAvailabilityDto } from './create-availability.dto';
export declare class AvailabilityService {
    private availabilityRepository;
    private doctorRepository;
    constructor(availabilityRepository: Repository<Availability>, doctorRepository: Repository<Doctor>);
    private validateDoctorId;
    createAvailability(doctorId: string, createAvailabilityDto: CreateAvailabilityDto): Promise<{
        success: boolean;
        message: string;
        data: Availability;
    }>;
    getDoctorAvailabilities(doctorId: string): Promise<{
        success: boolean;
        data: Availability[];
    }>;
    updateAvailability(doctorId: string, availabilityId: string, updateData: Partial<CreateAvailabilityDto>): Promise<{
        success: boolean;
        message: string;
        data: Availability;
    } | undefined>;
    deleteAvailability(doctorId: string, availabilityId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
