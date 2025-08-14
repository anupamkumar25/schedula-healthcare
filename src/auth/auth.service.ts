import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Patient } from '../entities/patient.entity';
import { Doctor } from '../entities/doctor.entity';
import { PatientSignupDto, DoctorSignupDto } from './dto/signup.dto';
import { LoginDto, UserType } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    private jwtService: JwtService,
  ) {}

  async patientSignUp(signupDto: PatientSignupDto) {
    const { name, email, mobNum, password, dob } = signupDto;

    const existingPatient = await this.patientRepository.findOne({
      where: [{ email }, { mobNum }],
    });

    if (existingPatient) {
      throw new ConflictException(
        'Patient with this email or mobile number already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = this.patientRepository.create({
      name,
      email,
      mobNum,
      password: hashedPassword,
      dob,
    });

    const savedPatient = await this.patientRepository.save(patient);

    const payload = {
      sub: savedPatient.patientId,
      email: savedPatient.email,
      UserType: 'patient',
    };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Patient registered successfully',
      data: {
        patient: savedPatient,
        token,
      },
    };
  }

  async doctorSignup(signupDto: DoctorSignupDto) {
    const { name, email, password, speciality, yearOfExp, bio } = signupDto;

    const existingDoctor = await this.doctorRepository.findOne({
      where: { email },
    });

    if (existingDoctor) {
      throw new ConflictException('Doctor with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = this.doctorRepository.create({
      name,
      email,
      password: hashedPassword,
      speciality,
      yearOfExp,
      bio,
    });

    const savedDDoctor = await this.doctorRepository.save(doctor);

    const payload = {
      sub: savedDDoctor.doctorId,
      email: savedDDoctor.email,
      UserType: 'doctor',
    };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Doctor registered successfully',
      data: {
        doctor: savedDDoctor,
        token,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, userType } = loginDto;
    let user: Patient | Doctor | null = null;
    let userId: string | undefined;

    if (userType === UserType.PATIENT) {
      user = await this.patientRepository.findOne({
        where: { email },
      });
      userId = user?.patientId;
    } else if (userType === UserType.DOCTOR) {
      user = await this.doctorRepository.findOne({
        where: { email },
      });
      userId = user?.doctorId;
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: userId, email: user.email, userType };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
        userType,
      },
    };
  }
}
