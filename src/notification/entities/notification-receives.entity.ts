import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from './user.entity';

@Entity()
export class NotificationReceives {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @ManyToOne(() => User, user => user.notificationReceives, { nullable: true })
  user: User;

  @ManyToOne(() => Notification, notification => notification.notificationReceives)
  notification: Notification;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isDeleted: boolean;
}