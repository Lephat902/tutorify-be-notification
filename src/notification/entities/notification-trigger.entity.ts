import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Notification } from './notification.entity';

@Entity()
export class NotificationTrigger {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => Notification, notification => notification.notificationTrigger)
  notification: Notification;
}