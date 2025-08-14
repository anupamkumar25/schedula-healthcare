import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  messageId: string;

  @Column('uuid')
  senderId: string;

  @Column('uuid')
  recipientId: string;

  @Column('text')
  content: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
