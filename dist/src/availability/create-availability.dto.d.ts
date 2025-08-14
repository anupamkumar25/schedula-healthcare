import { DayOfWeek } from 'src/entities/availability.entity';
export declare class CreateAvailabilityDto {
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    isActive?: boolean;
}
