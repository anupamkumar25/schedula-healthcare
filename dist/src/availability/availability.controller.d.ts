import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './create-availability.dto';
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
    };
}
export declare class AvailabilityController {
    private availabilityService;
    constructor(availabilityService: AvailabilityService);
    createAvailability(req: AuthenticatedRequest, createAvailabilityDto: CreateAvailabilityDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/availability.entity").Availability;
    }>;
    getDoctorAvailabilities(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: import("../entities/availability.entity").Availability[];
    }>;
    getSpecificDoctorAvailabilities(doctorId: string): Promise<{
        success: boolean;
        data: import("../entities/availability.entity").Availability[];
    }>;
    updateAvailability(req: AuthenticatedRequest, availabilityId: string, updateData: Partial<CreateAvailabilityDto>): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/availability.entity").Availability;
    } | undefined>;
    deleteAvailability(req: AuthenticatedRequest, availabilityId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
