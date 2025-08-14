import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  patientId: string;

  @Column({ type: 'varchar', unique: true })
  mobNum: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  @Exclude()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];

  @Column({ type: 'date' })
  dob: Date;

  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...rest } = this;
    return rest;
  }
}
