import { IsEmail, IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum UserType {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(UserType)
  userType: UserType;
}
