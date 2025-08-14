import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { Doctor } from '../../entities/doctor.entity';
interface JwtPayload {
    sub: string;
    email: string;
    userType: 'patient' | 'doctor';
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private patientRepository;
    private doctorRepository;
    constructor(patientRepository: Repository<Patient>, doctorRepository: Repository<Doctor>);
    validate(payload: JwtPayload): Promise<{
        userId: string;
        userType: "patient" | "doctor";
        email: string;
    }>;
}
export {};
