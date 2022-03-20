import { Injectable } from '@angular/core';
import { SOCKET_ID_UNDEFINED } from '@app/constants/services-errors';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

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

    async connect(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.socket = io(environment.serverUrlWebsocket, { transports: ['websocket'], upgrade: false });
            this.socket.on('connect', () => resolve());
        });
    }

    disconnect(): boolean {
        if (!this.socket) {
            return false;
        }
        this.socket.disconnect();
        return true;
    }

    getId(): string {
        if (!this.socket) throw new Error(SOCKET_ID_UNDEFINED);

        return this.socket.id;
    }

    on<T>(ev: string, handler: (arg: T) => void): void {
        if (!this.socket) {
            return;
        }
        this.socket.on(ev, handler);
    }

    emit<T>(ev: string, ...args: T[]): boolean {
        if (!this.socket) {
            return false;
        }
        this.socket.emit(ev, args);
        return true;
    }
}
