import { Repository } from 'typeorm';
import { Appointment, AppointmentType } from '../entities/appointment.entity';
import { Availability } from '../entities/availability.entity';
import { CreateAppointmentDto } from './create-appointment.dto';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { AppointmentQueue, QueueStatus } from 'src/entities/appointment-queue.entity';
export declare class AppointmentsService {
    private appointmentRepository;
    private availabilityRepository;
    private doctorRepository;
    private patientRepository;
    private queueRepo;
    constructor(appointmentRepository: Repository<Appointment>, availabilityRepository: Repository<Availability>, doctorRepository: Repository<Doctor>, patientRepository: Repository<Patient>, queueRepo: Repository<AppointmentQueue>);
    private validateAppointmentId;
    createAppointment(patientId: string, createAppointmentDto: CreateAppointmentDto): Promise<{
        queueId: string;
        note: string;
        patientId: string;
        doctorId: string;
        requestedDate: string;
        preferredTime: string;
        type: AppointmentType;
        priority: import("src/entities/appointment-queue.entity").QueuePriority;
        status: QueueStatus;
        originalAppointmentId: string;
        createdAt: Date;
        success: boolean;
        message: string;
    }>;
    getPatientAppointments(patientId: string): Promise<{
        success: boolean;
        data: Appointment[];
    }>;
    createAppointmentFromQueue(patientId: string, doctorId: string, appointmentDate: string, appointmentTime: string, appointmentType: string, predictedDuration: number): Promise<Appointment>;
    getDoctorAppointments(doctorId: string): Promise<{
        success: boolean;
        data: Appointment[];
    }>;
    getAppointmentsById(appointmentId: string): Promise<{
        success: boolean;
        data: Appointment;
    }>;
    getAppointmentFromQueue(queueId: string): Promise<{
        success: boolean;
        data: Appointment;
        queueStatus: QueueStatus;
        message?: undefined;
    } | {
        success: boolean;
        data: AppointmentQueue;
        message: string;
        queueStatus?: undefined;
    }>;
    cancelAppointment(appointmentId: string, userId: string): Promise<{
        success: boolean;
        message: string;
        data: Appointment;
    }>;
    private getDayOfWeek;
    private generateTokenNumber;
    private getStartAndEndDate;
    getTimeOfDay(appointmentTime: string): string;
    private calculateAge;
    private getPatientVisitCount;
    private addMinutesToTime;
}
