import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PatientSignupDto, DoctorSignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('patients/signup')
  async patientSignup(@Body(ValidationPipe) signupDto: PatientSignupDto) {
    return this.authService.patientSignUp(signupDto);
  }

  @Post('doctors/signup')
  async doctorSignup(@Body(ValidationPipe) signupDto: DoctorSignupDto) {
    return this.authService.doctorSignup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
