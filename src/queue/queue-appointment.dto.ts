import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';

export enum FlexibilityType {
  FLEXIBLE = 'flexible',
  MODERATE = 'moderate',
  STRICT = 'strict',
}

export class QueueAppointmentDDto {
  @IsUUID()
  doctorId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  requestedDate: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format',
  })
  preferredTime?: string;

  @IsEnum(FlexibilityType)
  flexibility: FlexibilityType;

  @IsString()
  @IsNotEmpty()
  appointmentType: string;

  @IsOptional()
  @IsString()
  complaint?: string;
}
