import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from '../entities/appointment.entity';
import { Availability, DayOfWeek } from '../entities/availability.entity';
import { CreateAppointmentDto } from './create-appointment.dto';
import { MlPredictionService } from 'ml/ml-predictions/ml-prediction.service';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import {
  AppointmentQueue,
  QueueStatus,
} from 'src/entities/appointment-queue.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(AppointmentQueue)
    private queueRepo: Repository<AppointmentQueue>,
  ) {}

  private validateAppointmentId(appointmentId: string): void {
    // Validate appointmentId is not null, undefined, or "null" string
    if (!appointmentId || appointmentId === 'null' || appointmentId === 'undefined') {
      throw new BadRequestException('Invalid appointment ID provided');
    }

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(appointmentId)) {
      throw new BadRequestException('Invalid appointment ID format');
    }
  }

  async createAppointment(
    patientId: string,
    createAppointmentDto: CreateAppointmentDto,
  ) {
    const { doctorId, appointmentDate, appointmentTime, type } =
      createAppointmentDto;

    const doctor = await this.doctorRepository.findOne({ where: { doctorId } });
    const patient = await this.patientRepository.findOne({
      where: { patientId },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');
    if (!patient) throw new NotFoundException('Patient not found');

    const queueEntry = this.queueRepo.create({
      patientId,
      doctorId,
      requestedDate: appointmentDate,
      preferredTime: appointmentTime,
      type: type || AppointmentType.NEWPATIENT,
      priority: 1,
      status: QueueStatus.PENDING,
    });

    const result = await this.queueRepo.save(queueEntry);

    return {
      success: true,
      message: 'Your request has been added to the scheduling queue. You will be notified once your appointment is scheduled.',
      ...result,
      queueId: result.queueId,
      note: 'The appointmentId will be available once your request is processed and scheduled.',
    };
  }

  async getPatientAppointments(patientId: string) {
    const appointments = await this.appointmentRepository.find({
      where: { patientId },
      relations: ['doctor'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });

    return {
      success: true,
      data: appointments,
    };
  }

  async createAppointmentFromQueue(
    patientId: string,
    doctorId: string,
    appointmentDate: string,
    appointmentTime: string,
    appointmentType: string,
    predictedDuration: number,
  ): Promise<Appointment> {
    const appointment = this.appointmentRepository.create({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      type: appointmentType,
      duration: predictedDuration,
      status: AppointmentStatus.UPCOMING,
      tokenNumber: await this.generateTokenNumber(doctorId, appointmentDate),
      actualEndTime: this.addMinutesToTime(appointmentTime, predictedDuration),
    } as Partial<Appointment>);

    return await this.appointmentRepository.save(appointment);
  }

  async getDoctorAppointments(doctorId: string) {
    const appointments = await this.appointmentRepository.find({
      where: { doctorId },
      relations: ['patient'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });

    return {
      success: true,
      data: appointments,
    };
  }

  async getAppointmentsById(appointmentId: string) {
    this.validateAppointmentId(appointmentId);

    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return {
      success: true,
      data: appointment,
    };
  }

  async getAppointmentFromQueue(queueId: string) {
    if (!queueId || queueId === 'null' || queueId === 'undefined') {
      throw new BadRequestException('Invalid queue ID provided');
    }

    const queueEntry = await this.queueRepo.findOne({
      where: { queueId },
    });

    if (!queueEntry) {
      throw new NotFoundException('Queue entry not found');
    }

    // If the queue entry has been processed and has an originalAppointmentId
    if (queueEntry.originalAppointmentId) {
      const appointment = await this.appointmentRepository.findOne({
        where: { appointmentId: queueEntry.originalAppointmentId },
        relations: ['doctor', 'patient'],
      });

      if (appointment) {
        return {
          success: true,
          data: appointment,
          queueStatus: queueEntry.status,
        };
      }
    }

    // Return queue entry if appointment hasn't been created yet
    return {
      success: true,
      data: queueEntry,
      message: 'Appointment is still in queue and will be scheduled soon.',
    };
  }

  async cancelAppointment(appointmentId: string, userId: string) {
    this.validateAppointmentId(appointmentId);

    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      throw new BadRequestException(
        'You are not authorized to cancel this appointment',
      );
    }

    appointment.status = AppointmentStatus.CANCELLED;

    const updatedAppointment =
      await this.appointmentRepository.save(appointment);

    return {
      success: true,
      message: 'Appointment cancelled successfully',
      data: updatedAppointment,
    };
  }

  private getDayOfWeek(date: string): DayOfWeek {
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayIndex = new Date(date).getDay();
    return dayNames[dayIndex] as DayOfWeek;
  }

  private async generateTokenNumber(
    doctorId: string,
    appointmentDate: string,
  ): Promise<string> {
    const appointmentCount = await this.appointmentRepository.count({
      where: { doctorId, appointmentDate },
    });

    return `${doctorId.slice(0, 4).toUpperCase()}-${appointmentDate.replace(/-/g, '')}-${(appointmentCount + 1).toString().padStart(3, '0')}`;
  }

  private getStartAndEndDate(
    appointmentDate: string,
    appointmentTime: string,
    duration: number = 30,
  ) {
    const [hour, minute] = appointmentTime.split(':').map(Number);

    const start = new Date(appointmentDate);
    start.setHours(hour, minute, 0, 0);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);

    const formatTime = (date: Date): string => {
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    return {
      startTime: formatTime(start),
      endTime: formatTime(end),
    };
  }

  getTimeOfDay(appointmentTime: string): string {
    const hour = parseInt(appointmentTime.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  private calculateAge(dateOfBirth: string | Date): number {
    if (!dateOfBirth) return 35;
    const birth = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  private async getPatientVisitCount(patientId: string): Promise<number> {
    try {
      const completedVisits = await this.appointmentRepository.count({
        where: {
          patientId,
          status: AppointmentStatus.COMPLETED,
        },
      });

      return completedVisits;
    } catch (err) {
      console.error('Error counting patient visits:', err);
      return 1;
    }
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number);
    const t = h * 60 + m + minutes;
    const nh = Math.floor(t / 60);
    const nm = t % 60;
    return `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}`;
  }
}
