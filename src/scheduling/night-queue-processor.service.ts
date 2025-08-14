import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { SegmentTreeService } from './segment-tree.service';
import {
  AppointmentQueue,
  QueueStatus,
} from '../entities/appointment-queue.entity';
import { Availability } from '../entities/availability.entity';
import { MlPredictionService } from 'ml/ml-predictions/ml-prediction.service';
import { AvailabilityService } from '../availability/availability.service';
import { AvailabilityManagementService } from './elastic-availability-management.service';

@Injectable()
export class QueueProcessorService {
  private isProcessing = false;
  constructor(
    @InjectRepository(AppointmentQueue)
    private queueRepo: Repository<AppointmentQueue>,
    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,
    private segmentTreeService: SegmentTreeService,
    private mlPredictionService: MlPredictionService,
    private availabilityManagementRepo: AvailabilityManagementService,
    private availabilityService: AvailabilityService,
  ) {}

  @Cron('*/1 * * * *')
  async processNightQueue() {
    if (this.isProcessing) {
      console.log(
        'Night queue processing is already running. Skipping this interval.',
      );
      return;
    }

    try {
      this.isProcessing = true;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      console.log(`Starting night queue processing for ${tomorrowStr}`);

      const doctorsWithQueue = await this.queueRepo
        .createQueryBuilder('queue')
        .select('DISTINCT queue.doctorId')
        .where('queue.requestedDate = :date', { date: tomorrowStr })
        .andWhere('queue.status = :status', { status: QueueStatus.PENDING })
        .getRawMany();

      for (const { doctorId } of doctorsWithQueue) {
        await this.processDoctorQueue(doctorId, tomorrowStr);
      }

      console.log(`Night queue processing completed for ${tomorrowStr}`);
    } catch (error) {
      console.error('An error occurred during night queue processing:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processDoctorQueue(doctorId: string, date: string) {
    console.log(`Processing queue for doctor ${doctorId} on ${date}`);

    const availability =
      await this.availabilityManagementRepo.getCurrentAvailability(
        doctorId,
        date,
      );
    if (!availability) {
      console.log(`No availability found for doctor ${doctorId} on ${date}`);
      return;
    }

    const tree = await this.segmentTreeService.buildAndPopulateTree(
      doctorId,
      date,
      availability,
    );

    if (!tree) {
      console.log(`Failed to build tree for doctor ${doctorId} on ${date}`);
      return;
    }

    const queueEntries = await this.queueRepo.find({
      where: {
        doctorId,
        requestedDate: date,
        status: QueueStatus.PENDING,
      },
      order: { priority: 'ASC', createdAt: 'ASC' },
    });

    console.log(`Found ${queueEntries.length} queue entries to process`);

    for (const queueEntry of queueEntries) {
      try {
        const predictedDuration = await this.getPredictedDuration(queueEntry);

        console.log(
          '🔍 Finding optimal slot for:',
          doctorId,
          date,
          predictedDuration,
        );
        console.log('🧠 Raw tree:', tree.debugTree?.());
        const optimalStartMinutes = this.segmentTreeService.findOptimalSlot(
          doctorId,
          date,
          predictedDuration,
        );

        if (optimalStartMinutes === null) {
          console.log(
            `No available slot for ${predictedDuration}min appointment`,
          );

          await this.queueRepo.update(queueEntry.queueId, {
            status: QueueStatus.FAILED,
          });
          continue;
        }

        const appointmentTime = this.minutesToTime(optimalStartMinutes);

        await this.availabilityManagementRepo.createAppointmentFromQueue(
          queueEntry,
          appointmentTime,
          date,
        );

        this.segmentTreeService.bookSlot(
          doctorId,
          date,
          optimalStartMinutes,
          optimalStartMinutes + predictedDuration,
        );

        await this.queueRepo.update(queueEntry.queueId, {
          status: QueueStatus.SCHEDULED,
        });

        console.log(
          `✅ Scheduled: ${appointmentTime} (${predictedDuration}min) for patient ${queueEntry.patientId}`,
        );
      } catch (error) {
        console.error(
          `Failed to process queue entry ${queueEntry.queueId}:`,
          error,
        );
        await this.queueRepo.update(queueEntry.queueId, {
          status: QueueStatus.FAILED,
        });
      }
    }
  }

  private async getPredictedDuration(
    queueEntry: AppointmentQueue,
  ): Promise<number> {
    try {
      const prediction =
        await this.mlPredictionService.predictAppointmentDuration({
          doctorSpecialty: 'General',
          patientAge: 35,
          appointmentType: queueEntry.type,
          timeOfDay: 'morning',
          dayOfWeek: this.getDayOfWeek(queueEntry.requestedDate),
          patientHistoryVisits: 1,
        });

      return prediction.success ? prediction.predictedDuration : 17;
    } catch (error) {
      console.error('ML prediction failed, using default duration:', error);
      return 17;
    }
  }

  private getDayOfWeek(date: string): string {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return days[new Date(date).getDay()];
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
