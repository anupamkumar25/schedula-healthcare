import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { Doctor } from '../entities/doctor.entity';
import { PatientSignupDto, DoctorSignupDto } from './dto/signup.dto';
import { LoginDto, UserType } from './dto/login.dto';
export declare class AuthService {
    private patientRepository;
    private doctorRepository;
    private jwtService;
    constructor(patientRepository: Repository<Patient>, doctorRepository: Repository<Doctor>, jwtService: JwtService);
    patientSignUp(signupDto: PatientSignupDto): Promise<{
        success: boolean;
        message: string;
        data: {
            patient: Patient;
            token: string;
        };
    }>;
    doctorSignup(signupDto: DoctorSignupDto): Promise<{
        success: boolean;
        message: string;
        data: {
            doctor: Doctor;
            token: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: Doctor | Patient;
            token: string;
            userType: UserType;
        };
    }>;
}
