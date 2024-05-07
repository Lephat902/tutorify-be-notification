import { Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from './user.entity';

@Entity()
export class NotificationTrigger {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @ManyToOne(() => User, user => user.notificationTriggers, { nullable: true, eager: true })
  user: User;

  @OneToOne(() => Notification, notification => notification.notificationTrigger)
  notification: Notification;
}