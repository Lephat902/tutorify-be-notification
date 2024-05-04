import { UserRole } from '@tutorify/shared';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ActionType } from './enums/action-type.enum';
import { EntityType } from './enums/entity-type.enum';
import { Notification } from './notification.entity';

@Entity()
@Unique(['actionType', 'entityType', 'triggererUserRole', 'recipientUserRole'])
export class NotificationType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: ActionType, nullable: false })
    actionType: ActionType;

    @Column({ type: 'enum', enum: EntityType, nullable: false })
    entityType: EntityType;

    @Column({ type: 'enum', enum: UserRole, nullable: true })
    triggererUserRole: UserRole;

    @Column({ type: 'enum', enum: UserRole, nullable: false })
    recipientUserRole: UserRole;

    @Column('text')
    templateVi: string;

    @Column('text')
    templateEn: string;

    @OneToMany(() => Notification, notification => notification.notificationType)
    notifications: Notification[];
}