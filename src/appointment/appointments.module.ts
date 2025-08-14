import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from '../entities/appointment.entity';
import { Availability } from '../entities/availability.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { MlPredictionService } from 'ml/ml-predictions/ml-prediction.service';
import { AppointmentQueue } from 'src/entities/appointment-queue.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Availability,
      Doctor,
      Patient,
      AppointmentQueue,
    ]),
  ],
  providers: [AppointmentsService, MlPredictionService],
  controllers: [AppointmentsController],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
