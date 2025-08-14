import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('slot-reservation')
export class SlotReservation {
  @PrimaryGeneratedColumn('uuid')
  reservationId: string;

  @Column({ type: 'uuid' })
  doctorId: string;

  @Column({ type: 'date' })
  reservedDate: string;

  @Column({ type: 'time' })
  reservedTime: string;

  @Column({ type: 'uuid' })
  queueId: string;

  @Column({ type: 'uuid' })
  patientId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
