import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Notification } from './notification.entity';

@Entity()
export class NotificationReceive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => Notification, notification => notification.notificationReceive)
  notification: Notification;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isDeleted: boolean;
}