import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { Doctor } from '../../entities/doctor.entity';

interface JwtPayload {
  sub: string;
  email: string;
  userType: 'patient' | 'doctor';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'thisIsVeryToughSecret',
    });

    console.log('🔐 JwtStrategy constructor called');
  }

  async validate(payload: JwtPayload) {
    const { sub, email, userType } = payload;

    let user: Patient | Doctor | null = null;

    if (userType === 'patient') {
      user = await this.patientRepository.findOne({
        where: { patientId: sub },
      });
    } else if (userType === 'doctor') {
      user = await this.doctorRepository.findOne({
        where: { doctorId: sub },
      });
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    return { userId: sub, userType, email };
  }
}
