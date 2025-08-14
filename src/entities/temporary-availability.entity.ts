import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum AvailabilityChangeType {
  EXPAND = 'expand',
  SHRINK = 'shrink',
}

@Entity('temporary-availability')
export class TemporaryAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  doctorId: string;

  @Column('date')
  effectiveDate: string;

  @Column({ type: 'enum', enum: AvailabilityChangeType })
  changeType: AvailabilityChangeType;

  @Column('time')
  originalStartTime: string;

  @Column('time')
  originalEndTime: string;

  @Column('time')
  newStartTime: string;

  @Column('time')
  newEndTime: string;

  @Column('json', { nullable: true })
  affectedAppointment: string[];

  @CreateDateColumn()
  createdAt: Date;
}
