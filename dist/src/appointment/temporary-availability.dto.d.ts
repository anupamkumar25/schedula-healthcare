import { AvailabilityChangeType } from 'src/entities/temporary-availability.entity';
export declare class CreateTemporaryAvailabilityDto {
    effectiveDate: string;
    type: AvailabilityChangeType;
    newStartTime: string;
    newEndTime: string;
}
