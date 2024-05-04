import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NotificationReceive } from './notification-receive.entity';
import { NotificationTrigger } from './notification-trigger.entity';
import { NotificationType } from './notification-type.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  data: object;

  @CreateDateColumn()
  triggeredAt: string;

  @ManyToOne(() => NotificationType, notificationType => notificationType.notifications)
  @Exclude()
  notificationType: NotificationType;

  @OneToOne(() => NotificationTrigger, notificationTrigger => notificationTrigger.notification, { cascade: true })
  @JoinColumn()
  notificationTrigger: NotificationTrigger;

  @OneToMany(() => NotificationReceive, notificationReceive => notificationReceive.notification, { cascade: true })
  notificationReceives: NotificationReceive[];

  text?: string;
}