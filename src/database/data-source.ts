import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { Availability } from '../entities/availability.entity';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentQueue } from '../entities/appointment-queue.entity';
import { TemporaryAvailability } from '../entities/temporary-availability.entity';
import { Message } from '../entities/message-entities';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: +configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  synchronize: false,
  logging: true,
  entities: [
    Patient,
    Doctor,
    Availability,
    Appointment,
    AppointmentQueue,
    TemporaryAvailability,
    Message,
  ],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
