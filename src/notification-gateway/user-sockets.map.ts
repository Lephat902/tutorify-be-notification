import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class UserSocketsMap {
    // Maps socket client to system user ID
    clientToUserId: Map<Socket, string> = new Map();

    // Maps system user ID to a set of socket clients
    userIdToClients: Map<string, Set<Socket>> = new Map();

    addConnection(client: Socket, userId: string) {
        this.clientToUserId.set(client, userId);
        if (!this.userIdToClients.has(userId)) {
            this.userIdToClients.set(userId, new Set());
        }
        this.userIdToClients.get(userId)?.add(client);
    }

    removeConnection(client: Socket) {
        const userId = this.clientToUserId.get(client);
        if (userId) {
            this.userIdToClients.get(userId)?.delete(client);
            if (this.getNumOfClientsByUserId(userId) === 0) {
                this.userIdToClients.delete(userId);
            }
            this.clientToUserId.delete(client);
        }
    }

    // Get Sockets by User ID
    getSocketClientsByUserId(userId: string): Socket[] {
        const sockets: Set<Socket> = this.userIdToClients.get(userId) ?? new Set();
        return Array.from(sockets);
    }

    // Optionally, get User ID by Socket Client ID
    getUserIdByClient(client: Socket): string | null {
        return this.clientToUserId.get(client) || null;
    }

    getNumOfClientsByUserId(userId: string): number {
        const numberOfClients = this.userIdToClients.get(userId)?.size;
        return numberOfClients ?? 0;
    }
}