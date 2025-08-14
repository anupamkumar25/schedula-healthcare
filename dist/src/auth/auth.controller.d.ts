import { AuthService } from './auth.service';
import { PatientSignupDto, DoctorSignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    patientSignup(signupDto: PatientSignupDto): Promise<{
        success: boolean;
        message: string;
        data: {
            patient: import("../entities/patient.entity").Patient;
            token: string;
        };
    }>;
    doctorSignup(signupDto: DoctorSignupDto): Promise<{
        success: boolean;
        message: string;
        data: {
            doctor: import("../entities/doctor.entity").Doctor;
            token: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: import("../entities/doctor.entity").Doctor | import("../entities/patient.entity").Patient;
            token: string;
            userType: import("./dto/login.dto").UserType;
        };
    }>;
}
