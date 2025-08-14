import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';

export enum AppointmentStatus {
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AppointmentType {
  ROUTINE = 'routine',
  FOLLOWUP = 'follow-up',
  NEWPATIENT = 'new-patient',
  EMERGENCY = 'emergency',
}

@Entity('Appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  appointmentId: string;

  @Column('string')
  doctorId: string;

  @Column('string')
  patientId: string;

  @Column({ type: 'date' })
  appointmentDate: string;

  @Column({ type: 'time' })
  appointmentTime: string;

  @Column({ type: 'time', nullable: true })
  actualStartTime: string;

  @Column({ type: 'time', nullable: true })
  actualEndTime: string;

  @Column({ type: 'int', default: 30 })
  duration: number;

  @Column({ type: 'varchar', unique: true })
  tokenNumber: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.UPCOMING,
  })
  status: AppointmentStatus;

  @Column({
    type: 'enum',
    enum: AppointmentType,
    default: AppointmentType.NEWPATIENT,
  })
  type: AppointmentType;

  @Column({ type: 'text', nullable: true })
  complaint: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments)
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.appointments)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;
}
