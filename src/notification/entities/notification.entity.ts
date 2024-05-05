import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NotificationReceive } from './notification-receive.entity';
import { NotificationTrigger } from './notification-trigger.entity';
import { NotificationType } from './notification-type.entity';
import { Exclude, Expose } from 'class-transformer';
import { NotificationUtils } from '../notification.utils';
import { Lang } from '../enums';

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
  @Exclude()
  notificationTrigger: NotificationTrigger;

  @OneToMany(() => NotificationReceive, notificationReceive => notificationReceive.notification, { cascade: true })
  @Exclude()
  notificationReceives: NotificationReceive[];

  @Exclude()
  private lang: Lang;

  setLang (lang: Lang) {
    this.lang = lang;
  }

  @Expose()
  get text() {
    const templateLang = this.lang || Lang.EN;
    return NotificationUtils.getNotificationText(this, templateLang);
  }

  @Expose()
  get isRead() {
    return this.notificationReceives[0].isRead;
  }
}