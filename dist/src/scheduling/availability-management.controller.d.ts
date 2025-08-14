import { AvailabilityManagementService } from './elastic-availability-management.service';
interface ExpandRequest {
    date?: string;
    day?: string;
    newEndTime: string;
}
interface ShrinkRequest {
    date?: string;
    day?: string;
    newEndTime: string;
}
export interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
    };
}
export declare class AvailabilityManagementController {
    private availabilityService;
    constructor(availabilityService: AvailabilityManagementService);
    expandAvailability(req: AuthenticatedRequest, request: ExpandRequest): Promise<{
        success: boolean;
        message: string;
        data: {
            targetDate: string;
            targetDay: string;
            originalEndTime: string;
            newEndTime: string;
            additionalSlots: number;
            queueEntriesProcessed: number;
        };
    }>;
    shrinkAvailability(req: AuthenticatedRequest, request: ShrinkRequest): Promise<{
        success: boolean;
        message: string;
        data: {
            targetDate: string;
            targetDay: string;
            originalEndTime: string;
            newEndTime: string;
            affectedAppointments: number;
            queueEntriesCreated: number;
        };
    }>;
}
export {};
