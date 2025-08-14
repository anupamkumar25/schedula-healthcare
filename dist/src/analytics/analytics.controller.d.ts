import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(from?: string, to?: string): Promise<{
        success: boolean;
        data: {
            totalAppointments: number;
            statusBreakdown: {
                upcoming: number;
                completed: number;
                cancelled: number;
            };
            queue: {
                pending: number;
                scheduled: number;
                failed: number;
            };
        };
    }>;
    getDoctor(doctorId: string, from?: string, to?: string): Promise<{
        success: boolean;
        data: {
            appointments: number;
            queue: number;
            statusBreakdown: {
                upcoming: number;
                completed: number;
                cancelled: number;
            };
        };
    }>;
    getQueue(from?: string, to?: string): Promise<{
        success: boolean;
        data: {
            pending: number;
            scheduled: number;
            failed: number;
        };
    }>;
}
