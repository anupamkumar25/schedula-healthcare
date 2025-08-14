import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  TemporaryAvailability,
  AvailabilityChangeType,
} from '../entities/temporary-availability.entity';
import {
  AppointmentQueue,
  QueuePriority,
  QueueStatus,
} from '../entities/appointment-queue.entity';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { Availability, DayOfWeek } from '../entities/availability.entity';
import { SegmentTreeService } from 'src/segment-tree.service';

type expandedResult = {
  slotsCreated: number;
  appointmentScheduled: number;
};

type shrunkResult = {
  queueEntriesCreated: number;
};

@Injectable()
export class AvailabilityManagementService {
  constructor(
    @InjectRepository(TemporaryAvailability)
    private tempAvailabilityRepo: Repository<TemporaryAvailability>,
    @InjectRepository(AppointmentQueue)
    private queueRepo: Repository<AppointmentQueue>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,
    private segmentTreeService: SegmentTreeService,
  ) {}

  async expandAvailability(doctorId: string, date: string, newEndTime: string) {
    console.log(
      `Doctor ${doctorId} expanding availability on ${date} until ${newEndTime}`,
    );

    const currentAvailability = await this.getCurrentAvailability(
      doctorId,
      date,
    );

    if (!currentAvailability) {
      throw new BadRequestException('No availability found for this date');
    }

    if (newEndTime <= currentAvailability.endTime) {
      throw new BadRequestException(
        'New end time must be later than current end time',
      );
    }

    const tempAvailability = await this.tempAvailabilityRepo.save({
      doctorId: doctorId,
      effectiveDate: date,
      changeType: AvailabilityChangeType.EXPAND,
      originalStartTime: currentAvailability.startTime,
      originalEndTime: currentAvailability.endTime,
      newStartTime: currentAvailability.startTime,
      newEndTime: newEndTime,
      affectedAppointments: [],
    });

    const result: expandedResult =
      await this.processExpansion(tempAvailability);

    return {
      success: true,
      message: 'AAvailability expanded successfully',
      date: {
        originalEndTime: currentAvailability.endTime,
        newEndTime,
        additionalSlots: result.slotsCreated,
        queueEntriesProcessed: result.appointmentScheduled,
      },
    };
  }

  async shrinkAvailability(doctorId: string, date: string, newEndTime: string) {
    console.log(
      `Doctor ${doctorId} shrinking availability on ${date} until ${newEndTime}`,
    );

    const currentAvailability = await this.getCurrentAvailability(
      doctorId,
      date,
    );

    if (!currentAvailability) {
      throw new BadRequestException('No availability found for this date');
    }

    if (newEndTime >= currentAvailability.endTime) {
      throw new BadRequestException(
        'New end time must be earlier than current end time',
      );
    }

    const affectedAppointments = await this.findAffectedAppointments(
      doctorId,
      date,
      newEndTime,
      currentAvailability.endTime,
    );

    const tempAvailability = await this.tempAvailabilityRepo.save({
      doctorId,
      effectiveDate: date,
      changeType: AvailabilityChangeType.SHRINK,
      originalStartTime: currentAvailability.startTime,
      originalEndTime: currentAvailability.endTime,
      newStartTime: currentAvailability.startTime,
      newEndTime,
      affectedAppointments: affectedAppointments.map(
        (apt) => apt.appointmentId,
      ),
    });

    const result: shrunkResult = await this.processShrinking(
      tempAvailability,
      affectedAppointments,
    );

    return {
      success: true,
      message: 'Availability shrunk successfully',
      data: {
        originalEn: currentAvailability.endTime,
        newEndTime,
        affectedAppointments: affectedAppointments.length,
        queueEntriesCreated: result.queueEntriesCreated,
      },
    };
  }

  private async processExpansion(
    tempAvailability: TemporaryAvailability,
  ): Promise<expandedResult> {
    const { doctorId, effectiveDate, originalEndTime, newEndTime } =
      tempAvailability;

    const queueEntries = await this.queueRepo.find({
      where: {
        doctorId,
        requestedDate: effectiveDate,
        status: QueueStatus.PENDING,
      },
    });

    if (queueEntries.length === 0) {
      console.log('No queue entries to process for expansion');
      return { slotsCreated: 0, appointmentScheduled: 0 };
    }

    this.segmentTreeService.addSlots(
      doctorId,
      effectiveDate,
      originalEndTime,
      newEndTime,
    );

    let appointmentScheduled = 0;
    const expandedDurationMinutes =
      this.timeToMinutes(newEndTime) - this.timeToMinutes(originalEndTime);
    const availabilitySlots = Math.floor(expandedDurationMinutes / 17);

    console.log(
      `Processing ${queueEntries.length} queue entries for ${availabilitySlots} new slots`,
    );

    for (const queueEntry of queueEntries) {
      if (appointmentScheduled >= availabilitySlots) break;

      try {
        const optimalStartMinutes = this.segmentTreeService.findOptimalSlot(
          doctorId,
          effectiveDate,
          17,
        );

        if (optimalStartMinutes === null) {
          console.log('No more optimal slots available');
          break;
        }

        const appointmentTime = this.minutesToTime(optimalStartMinutes);

        await this.createAppointmentFromQueue(queueEntry, appointmentTime);

        this.segmentTreeService.bookSlot(
          doctorId,
          effectiveDate,
          optimalStartMinutes,
          optimalStartMinutes + 17,
        );

        await this.queueRepo.update(queueEntry.queueId, {
          status: QueueStatus.SCHEDULED,
        });

        console.log(
          `Scheduled queue entry: ${appointmentTime} for patient ${queueEntry.patientId}`,
        );
        appointmentScheduled++;
      } catch (error) {
        console.error(
          `Failed to schedule queue entry ${queueEntry.queueId}:`,
          error,
        );
      }
    }
    return { slotsCreated: availabilitySlots, appointmentScheduled };
  }

  private async processShrinking(
    tempAvailability: TemporaryAvailability,
    affectedAppointment: Appointment[],
  ): Promise<shrunkResult> {
    let queueEntriesCreated = 0;

    for (const appointment of affectedAppointment) {
      try {
        await this.queueRepo.save({
          patientId: appointment.doctorId,
          doctorId: appointment.doctorId,
          requestedDate: appointment.appointmentDate,
          priority: QueuePriority.HIGH,
          status: QueueStatus.PENDING,
          originalAppointmentId: appointment.appointmentId,
        });

        await this.appointmentRepo.update(appointment.appointmentId, {
          status: AppointmentStatus.CANCELLED,
        });

        queueEntriesCreated++;

        console.log(
          `Moved appointment to queue: Patient ${appointment.patientId} `,
        );
      } catch (error) {
        console.error(`Failed to move appointment to queue:`, error);
      }
    }
    return { queueEntriesCreated };
  }

  public async getCurrentAvailability(doctorId: string, date: string) {
    const dayOfWeek = this.getDayOfWeek(date);
    return await this.availabilityRepo.findOne({
      where: { doctorId, day: dayOfWeek, isActive: true },
    });
  }

  private async findAffectedAppointments(
    doctorId: string,
    date: string,
    newEndTime: string,
    originalEndTime: string,
  ) {
    return await this.appointmentRepo.find({
      where: {
        doctorId,
        appointmentDate: date,
        appointmentTime: Between(newEndTime, originalEndTime),
        status: AppointmentStatus.UPCOMING,
      },
    });
  }

  public async createAppointmentFromQueue(
    queueEntry: AppointmentQueue,
    appointmentTime: string,
  ) {
    const appointment = this.appointmentRepo.create({
      patientId: queueEntry.patientId,
      doctorId: queueEntry.doctorId,
      appointmentDate: queueEntry.requestedDate,
      appointmentTime,
      type: queueEntry.type,
      duration: 17,
      status: AppointmentStatus.UPCOMING,
      tokenNumber: `Q${Date.now().toString().slice(-6)}`,
    });

    const savedAppointment = await this.appointmentRepo.save(appointment);
    
    // Update the queue entry with the originalAppointmentId
    await this.queueRepo.update(queueEntry.queueId, {
      originalAppointmentId: savedAppointment.appointmentId,
      status: QueueStatus.SCHEDULED,
    });

    return savedAppointment;
  }

  private getDayOfWeek(date: string): DayOfWeek {
    const days = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    return days[new Date(date).getDay()];
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
