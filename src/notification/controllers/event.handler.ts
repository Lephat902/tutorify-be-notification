import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import {
    UserCreatedEventPattern,
    UserCreatedEventPayload,
    UserDeletedEventPattern,
    UserDeletedEventPayload,
    UserUpdatedEventPattern,
    UserUpdatedEventPayload,
} from '@tutorify/shared';
import { NotificationRepository, UserRepository } from '../repositories';

@Controller()
export class EventHandler {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly notificationRepository: NotificationRepository,
    ) { }

    @EventPattern(new UserCreatedEventPattern())
    async handleUserCreated(payload: UserCreatedEventPayload) {
        await this.handleUserCreatedOrUpdated(payload);
    }

    @EventPattern(new UserUpdatedEventPattern())
    async handleUserUpdated(payload: UserUpdatedEventPayload) {
        await this.handleUserCreatedOrUpdated(payload);
    }

    @EventPattern(new UserDeletedEventPattern())
    async handleUserDeleted(payload: UserDeletedEventPayload) {
        const { userId } = payload;
        await this.notificationRepository.delete({
            notificationTrigger: {
                user: {
                    id: userId
                }
            }
        });
        await this.userRepository.delete({ id: userId });
    }

    private async handleUserCreatedOrUpdated(
        payload: UserCreatedEventPayload | UserUpdatedEventPayload
    ) {
        const { userId, gender, firstName, middleName, lastName, avatar } = payload;
        const newUser = this.userRepository.create({
            id: userId,
            gender, firstName, middleName, lastName,
            avatar: avatar?.url,
        })
        await this.userRepository.save(newUser);
    }
}
