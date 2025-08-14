import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Patient } from './entities/patient.entity';
import { Doctor } from './entities/doctor.entity';
import { AuthModule } from './auth/auth.module';
import { Availability } from './entities/availability.entity';
import { Appointment } from './entities/appointment.entity';
import { AvailabilityModule } from './availability/availability.module';
import { AppointmentsModule } from './appointment/appointments.module';
import { AppointmentQueue } from './entities/appointment-queue.entity';
import { TemporaryAvailability } from './entities/temporary-availability.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulingModule } from './scheduling/scheduling.module';
import { ChatModule } from './chat/chat.module';
import { Message } from './entities/message-entities';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [
          Patient,
          Doctor,
          Availability,
          Appointment,
          AppointmentQueue,
          TemporaryAvailability,
          Message,
        ],
        synchronize: false,
        logging: true,
        retryAttempts: 5,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    AvailabilityModule,
    AppointmentsModule,
    SchedulingModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
