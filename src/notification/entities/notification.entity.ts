import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NotificationReceive } from './notification-receive.entity';
import { NotificationTrigger } from './notification-trigger.entity';
import { NotificationType } from './notification-type.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  data: string;

  @CreateDateColumn()
  triggeredAt: string;

  @ManyToOne(() => NotificationType, notificationType => notificationType.notifications)
  notificationType: NotificationType;

  @OneToOne(() => NotificationTrigger, notificationTrigger => notificationTrigger.notification)
  @JoinColumn()
  notificationTrigger: NotificationTrigger;

  @OneToOne(() => NotificationReceive, notificationReceive => notificationReceive.notification)
  @JoinColumn()
  notificationReceive: NotificationReceive;

  text: string;
}