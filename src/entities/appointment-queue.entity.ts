import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { AppointmentType } from './appointment.entity';

export enum QueueStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SCHEDULED = 'scheduled',
  FAILED = 'failed',
}

export enum QueuePriority {
  HIGH = 1,
  NORMAL = 2,
}

@Entity('appointment-queue')
export class AppointmentQueue {
  @PrimaryGeneratedColumn('uuid')
  queueId: string;

  @Column('uuid')
  patientId: string;

  @Column('uuid')
  doctorId: string;

  @Column('date')
  requestedDate: string;

  @Column('time', { nullable: true })
  preferredTime: string;

  @Column({
    type: 'enum',
    enum: AppointmentType,
    default: AppointmentType.NEWPATIENT,
  })
  type: AppointmentType;

  @Column({ type: 'enum', enum: QueuePriority, default: QueuePriority.NORMAL })
  priority: QueuePriority;

  @Column({ type: 'enum', enum: QueueStatus, default: QueueStatus.PENDING })
  status: QueueStatus;

  @Column('uuid', { nullable: true })
  originalAppointmentId: string;

  @CreateDateColumn()
  createdAt: Date;
}
