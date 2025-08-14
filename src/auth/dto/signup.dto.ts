import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsInt,
  Min,
  Matches,
} from 'class-validator';

export class PatientSignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  mobNum: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dob must be in YYYY-MM-DD format',
  })
  dob: string;
}

export class DoctorSignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  speciality: string;

  @IsInt()
  @Min(0)
  yearOfExp: number;

  @IsString()
  @IsNotEmpty()
  bio: string;
}
