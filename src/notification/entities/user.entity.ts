import { Gender } from '@tutorify/shared';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { NotificationReceives } from './notification-receives.entity';
import { NotificationTrigger } from './notification-trigger.entity';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => NotificationTrigger, notificationTrigger => notificationTrigger.user)
  notificationTriggers: NotificationTrigger[];

  @OneToMany(() => NotificationReceives, notificationReceives => notificationReceives.user, { cascade: true })
  notificationReceives: NotificationReceives[];
}