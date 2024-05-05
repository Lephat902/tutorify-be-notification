import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Lang } from 'src/notification/enums';

@Injectable()
export class SocketLangMap {
    private readonly socketLangPref: Map<string, Lang> = new Map();

    set(client: Socket, lang: Lang) {
        this.socketLangPref.set(client.id, lang);
    }

    delete(client: Socket) {
        this.socketLangPref.delete(client.id);
    }

    get(client: Socket) {
        return this.socketLangPref.get(client.id);
    }
}