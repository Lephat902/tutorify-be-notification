import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Notification } from './notification.entity';

@Entity()
export class NotificationReceives {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => Notification, notification => notification.notificationReceives)
  notification: Notification;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isDeleted: boolean;
}