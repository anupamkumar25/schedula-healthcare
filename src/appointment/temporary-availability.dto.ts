import { IsEnum, IsString, IsNotEmpty, Matches } from 'class-validator';
import { AvailabilityChangeType } from 'src/entities/temporary-availability.entity';

export class CreateTemporaryAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  effectiveDate: string;

  @IsEnum(AvailabilityChangeType)
  type: AvailabilityChangeType;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  newStartTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  newEndTime: string;
}
