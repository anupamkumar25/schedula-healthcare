import {
  forwardRef,
  Injectable,
  BadRequestException,
  Inject,
} from '@nestjs/common';
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
import { SegmentTreeService } from './segment-tree.service';

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
    @Inject(forwardRef(() => SegmentTreeService))
    private segmentTreeService: SegmentTreeService,
  ) {}

  async expandAvailability(doctorId: string, newEndTime: string, date?: string, day?: string) {
    // Determine the target date
    let targetDate: string;
    let targetDay: string;
    
    if (date) {
      targetDate = date;
      targetDay = this.getDayOfWeek(date);
    } else if (day) {
      targetDay = day.toLowerCase();
      // For day-based changes, we'll use today's date as a reference
      // but the change will apply to the recurring schedule
      targetDate = new Date().toISOString().split('T')[0];
    } else {
      throw new BadRequestException('Either date or day must be provided');
    }

    console.log(
      `Doctor ${doctorId} expanding availability on ${targetDate} (${targetDay}) until ${newEndTime}`,
    );

    const currentAvailability = await this.getCurrentAvailability(
      doctorId,
      targetDate,
      targetDay,
    );

    if (!currentAvailability) {
      throw new BadRequestException(`No availability found for ${day || date}`);
    }

    if (newEndTime <= currentAvailability.endTime) {
      throw new BadRequestException(
        'New end time must be later than current end time',
      );
    }

    let tempAvailability = await this.tempAvailabilityRepo.findOne({
      where: { doctorId, effectiveDate: targetDate },
    });

    if (tempAvailability) {
      tempAvailability.changeType = AvailabilityChangeType.EXPAND;
      tempAvailability.newEndTime = newEndTime;
    } else {
      tempAvailability = this.tempAvailabilityRepo.create({
        doctorId: doctorId,
        effectiveDate: targetDate,
        changeType: AvailabilityChangeType.EXPAND,
        originalStartTime: currentAvailability.startTime,
        originalEndTime: currentAvailability.endTime,
        newStartTime: currentAvailability.startTime,
        newEndTime: newEndTime,
      });
    }

    const savedTempAvailability =
      await this.tempAvailabilityRepo.save(tempAvailability);

    const result: expandedResult = await this.processExpansion(
      savedTempAvailability,
    );

    return {
      success: true,
      message: 'Availability expanded successfully',
      data: {
        targetDate,
        targetDay,
        originalEndTime: currentAvailability.endTime,
        newEndTime,
        additionalSlots: result.slotsCreated,
        queueEntriesProcessed: result.appointmentScheduled,
      },
    };
  }

  async shrinkAvailability(doctorId: string, newEndTime: string, date?: string, day?: string) {
    // Determine the target date
    let targetDate: string;
    let targetDay: string;
    
    if (date) {
      targetDate = date;
      targetDay = this.getDayOfWeek(date);
    } else if (day) {
      targetDay = day.toLowerCase();
      // For day-based changes, we'll use today's date as a reference
      // but the change will apply to the recurring schedule
      targetDate = new Date().toISOString().split('T')[0];
    } else {
      throw new BadRequestException('Either date or day must be provided');
    }

    console.log(
      `Doctor ${doctorId} shrinking availability on ${targetDate} (${targetDay}) until ${newEndTime}`,
    );

    const currentAvailability = await this.getCurrentAvailability(
      doctorId,
      targetDate,
      targetDay,
    );

    if (!currentAvailability) {
      throw new BadRequestException(`No availability found for ${day || date}`);
    }

    if (newEndTime >= currentAvailability.endTime) {
      throw new BadRequestException(
        'New end time must be earlier than current end time',
      );
    }

    const existingTemp = await this.tempAvailabilityRepo.findOne({
      where: { doctorId, effectiveDate: targetDate },
    });

    const affectedAppointments = await this.findAffectedAppointments(
      doctorId,
      targetDate,
      newEndTime,
      currentAvailability.endTime,
    );

    if (existingTemp) {
      await this.tempAvailabilityRepo.update(existingTemp.id, {
        changeType: AvailabilityChangeType.SHRINK,
        newEndTime: newEndTime,
        affectedAppointment: affectedAppointments.map(
          (apt) => apt.appointmentId,
        ),
      });
    } else {
      await this.tempAvailabilityRepo.save({
        doctorId,
        effectiveDate: targetDate,
        changeType: AvailabilityChangeType.SHRINK,
        originalStartTime: currentAvailability.startTime,
        originalEndTime: currentAvailability.endTime,
        newStartTime: currentAvailability.startTime,
        newEndTime,
        affectedAppointments: affectedAppointments.map(
          (apt) => apt.appointmentId,
        ),
      });
    }

    const newAvailability = {
      startTime: currentAvailability.startTime,
      endTime: newEndTime,
    };

    await this.segmentTreeService.buildAndPopulateTree(
      doctorId,
      targetDate,
      newAvailability,
    );

    const result: shrunkResult =
      await this.processShrinking(affectedAppointments);

    return {
      success: true,
      message: 'Availability shrunk successfully',
      data: {
        targetDate,
        targetDay,
        originalEndTime: currentAvailability.endTime,
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

    const expansionDate = new Date(effectiveDate);
    expansionDate.setDate(expansionDate.getDate() + 1);
    const nextDayStr = expansionDate.toISOString().split('T')[0];

    const queueEntries = await this.queueRepo.find({
      where: {
        doctorId,
        requestedDate: nextDayStr,
        status: QueueStatus.PENDING,
      },
    });

    if (queueEntries.length === 0) {
      console.log('No queue entries to process for expansion');
      return { slotsCreated: 0, appointmentScheduled: 0 };
    }
    const newAvailability = {
      startTime: tempAvailability.newStartTime,
      endTime: newEndTime,
    };

    await this.segmentTreeService.buildAndPopulateTree(
      doctorId,
      effectiveDate,
      newAvailability,
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

        await this.createAppointmentFromQueue(
          queueEntry,
          appointmentTime,
          effectiveDate,
        );

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
    affectedAppointment: Appointment[],
  ): Promise<shrunkResult> {
    let queueEntriesCreated = 0;

    for (const appointment of affectedAppointment) {
      try {
        await this.queueRepo.save({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          requestedDate: appointment.appointmentDate,
          priority: QueuePriority.NORMAL,
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

  // Inside the getCurrentAvailability function

  public async getCurrentAvailability(doctorId: string, date: string, day?: string) {
    // ADD THIS LOG
    console.log(
      `[getCurrentAvailability] Checking for temp availability for doctor ${doctorId} on date ${date}`,
    );
    const tempAvailability = await this.tempAvailabilityRepo.findOne({
      where: { doctorId, effectiveDate: date },
    });

    if (tempAvailability) {
      // ADD THIS LOG
      console.log(
        '[getCurrentAvailability] Found temp record:',
        tempAvailability,
      );
      return {
        startTime: tempAvailability.newStartTime,
        endTime: tempAvailability.newEndTime,
      };
    }

    // ADD THIS LOG
    console.log(
      '[getCurrentAvailability] No temp record found. Falling back to permanent schedule.',
    );
    
    // Use provided day or derive from date
    const dayOfWeek = day ? this.mapDayStringToEnum(day) : this.getDayOfWeek(date);
    return this.availabilityRepo.findOne({
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
    effectiveDate: string,
  ) {
    console.log('function running');
    const appointment = this.appointmentRepo.create({
      patientId: queueEntry.patientId,
      doctorId: queueEntry.doctorId,
      appointmentDate: effectiveDate,
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
    
    console.log('function ended');
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

  private mapDayStringToEnum(day: string): DayOfWeek {
    const dayMap: { [key: string]: DayOfWeek } = {
      'sunday': DayOfWeek.SUNDAY,
      'monday': DayOfWeek.MONDAY,
      'tuesday': DayOfWeek.TUESDAY,
      'wednesday': DayOfWeek.WEDNESDAY,
      'thursday': DayOfWeek.THURSDAY,
      'friday': DayOfWeek.FRIDAY,
      'saturday': DayOfWeek.SATURDAY,
    };
    
    const mappedDay = dayMap[day.toLowerCase()];
    if (!mappedDay) {
      throw new BadRequestException(`Invalid day: ${day}. Must be one of: sunday, monday, tuesday, wednesday, thursday, friday, saturday`);
    }
    
    return mappedDay;
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
