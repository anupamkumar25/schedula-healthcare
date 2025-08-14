"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const patient_entity_1 = require("../entities/patient.entity");
const doctor_entity_1 = require("../entities/doctor.entity");
const login_dto_1 = require("./dto/login.dto");
let AuthService = class AuthService {
    patientRepository;
    doctorRepository;
    jwtService;
    constructor(patientRepository, doctorRepository, jwtService) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.jwtService = jwtService;
    }
    async patientSignUp(signupDto) {
        const { name, email, mobNum, password, dob } = signupDto;
        const existingPatient = await this.patientRepository.findOne({
            where: [{ email }, { mobNum }],
        });
        if (existingPatient) {
            throw new common_1.ConflictException('Patient with this email or mobile number already exists');
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
    async doctorSignup(signupDto) {
        const { name, email, password, speciality, yearOfExp, bio } = signupDto;
        const existingDoctor = await this.doctorRepository.findOne({
            where: { email },
        });
        if (existingDoctor) {
            throw new common_1.ConflictException('Doctor with this email already exists');
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
    async login(loginDto) {
        const { email, password, userType } = loginDto;
        let user = null;
        let userId;
        if (userType === login_dto_1.UserType.PATIENT) {
            user = await this.patientRepository.findOne({
                where: { email },
            });
            userId = user?.patientId;
        }
        else if (userType === login_dto_1.UserType.DOCTOR) {
            user = await this.doctorRepository.findOne({
                where: { email },
            });
            userId = user?.doctorId;
        }
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(1, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map