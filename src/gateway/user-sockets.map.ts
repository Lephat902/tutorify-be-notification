import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";

@Injectable()
export class UserSocketsMap {
    // Maps socket client ID to system user ID
    clientIdToUserId: Map<string, string> = new Map();

    // Maps system user ID to a set of socket client IDs
    userIdToClientIds: Map<string, Set<string>> = new Map();

    // Example method to add a connection
    addConnection(clientId: string, userId: string) {
        this.clientIdToUserId.set(clientId, userId);
        if (!this.userIdToClientIds.has(userId)) {
            this.userIdToClientIds.set(userId, new Set());
        }
        this.userIdToClientIds.get(userId)?.add(clientId);
    }

    // Example method to remove a connection
    removeConnection(clientId: string) {
        const userId = this.clientIdToUserId.get(clientId);
        if (userId) {
            this.userIdToClientIds.get(userId)?.delete(clientId);
            if (this.getNumOfClientsByUserId(userId) === 0) {
                this.userIdToClientIds.delete(userId);
            }
            this.clientIdToUserId.delete(clientId);
        }
    }

    // Get Sockets by User ID
    getSocketClientsByUserId(server: Server, userId: string): Socket[] {
        const clientIds = this.userIdToClientIds.get(userId);
        if (clientIds) {
            return Array.from(clientIds)
                .map(clientId => server.sockets.sockets.get(clientId))
                .filter(socket => socket !== undefined);
        }
        return [];
    }

    // Optionally, get User ID by Socket Client ID
    getUserIdByClientId(clientId: string): string | null {
        return this.clientIdToUserId.get(clientId) || null;
    }

    getNumOfClientsByUserId(userId: string): number {
        const numberOfClients = this.userIdToClientIds.get(userId)?.size;
        return numberOfClients ?? 0;
    }
}