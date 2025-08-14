import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityManagementController } from './availability-management.controller';
import { SegmentTreeService } from './segment-tree.service';
import { TemporaryAvailability } from '../entities/temporary-availability.entity';
import { AppointmentQueue } from '../entities/appointment-queue.entity';
import { Appointment } from '../entities/appointment.entity';
import { Availability } from '../entities/availability.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { MlPredictionService } from 'ml/ml-predictions/ml-prediction.service';
import { QueueProcessorService } from './night-queue-processor.service';
import { AvailabilityManagementService } from './elastic-availability-management.service';
import { AvailabilityModule } from 'src/availability/availability.module';

@Module({
  imports: [
    AvailabilityModule,
    TypeOrmModule.forFeature([
      TemporaryAvailability,
      AppointmentQueue,
      Appointment,
      Availability,
      Doctor,
      Patient,
    ]),
  ],

  providers: [
    AvailabilityManagementService,
    SegmentTreeService,
    QueueProcessorService,
    MlPredictionService,
  ],

  controllers: [AvailabilityManagementController],

  exports: [
    AvailabilityManagementService,
    SegmentTreeService,
    QueueProcessorService,
  ],
})
export class SchedulingModule {}
