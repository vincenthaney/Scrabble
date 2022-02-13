import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import * as SOCKET_ERROR from './socket.service.error';
@Injectable({
    providedIn: 'root',
})
export default class SocketService {
    private socket: Socket;

    async initializeService(): Promise<void> {
        return this.connect();
    }

    isSocketAlive(): boolean {
        return this.socket && this.socket.connected;
    }

    async connect() {
        return new Promise<void>((resolve) => {
            this.socket = io(environment.serverUrlWebsocket, { transports: ['websocket'], upgrade: false });
            this.socket.on('connect', () => resolve());
        });
    }

    disconnect() {
        if (!this.socket) {
            return false;
        }
        this.socket.disconnect();
        return true;
    }

    getId(): string {
        if (!this.socket) throw new Error(SOCKET_ERROR.SOCKET_ID_UNDEFINED);

        return this.socket.id;
    }

    on<T>(ev: string, handler: (arg: T) => void) {
        if (!this.socket) {
            return;
        }
        this.socket.on(ev, handler);
    }

    emit<T>(ev: string, ...args: T[]) {
        if (!this.socket) {
            return false;
        }
        this.socket.emit(ev, args);
        return true;
    }
}
