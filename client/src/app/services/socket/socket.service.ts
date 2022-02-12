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
        return new Promise((resolve, reject) => {
            try {
                this.connect();
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    isSocketAlive(): boolean {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(environment.serverUrlWebsocket, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        if (!this.socket) {
            return;
        }
        this.socket.disconnect();
    }

    getId(): string {
        if (!this.socket) throw new Error(SOCKET_ID_UNDEFINED);

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
            return;
        }
        this.socket.emit(ev, args);
    }
}
