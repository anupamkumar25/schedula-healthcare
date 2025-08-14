import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentQueue } from '../entities/appointment-queue.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Appointment, AppointmentQueue])],
	controllers: [AnalyticsController],
	providers: [AnalyticsService],
	exports: [AnalyticsService],
})
export class AnalyticsModule {}


