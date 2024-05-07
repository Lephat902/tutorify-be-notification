import { Exclude, Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationReceives } from './notification-receives.entity';
import { NotificationTrigger } from './notification-trigger.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  data: object;

  @CreateDateColumn()
  triggeredAt: string;

  @Column({ type: 'enum', enum: NotificationType, nullable: false })
  notificationType: NotificationType;

  @OneToOne(() => NotificationTrigger, notificationTrigger => notificationTrigger.notification, { cascade: true, eager: true })
  @JoinColumn()
  @Exclude()
  notificationTrigger: NotificationTrigger;

  @OneToMany(() => NotificationReceives, notificationReceives => notificationReceives.notification, { cascade: true })
  @Exclude()
  notificationReceives: NotificationReceives[];

  @Expose()
  get isRead() {
    return this.notificationReceives[0].isRead;
  }

  @Expose()
  get triggerer() {
    return this.notificationTrigger.user;
  }
}