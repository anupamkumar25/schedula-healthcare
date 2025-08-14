import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Matches,
} from 'class-validator';
import { DayOfWeek } from 'src/entities/availability.entity';

export class CreateAvailabilityDto {
  @IsEnum(DayOfWeek)
  day: DayOfWeek;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
