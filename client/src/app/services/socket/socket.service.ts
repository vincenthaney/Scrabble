import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
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

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(environment.serverUrlWebsocket, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
    }

    getId(): string {
        return this.socket.id;
    }

    on<T>(ev: string, handler: (arg: T) => void) {
        this.socket.on(ev, handler);
    }

    emit<T>(ev: string, ...args: T[]) {
        this.socket.emit(ev, args);
    }
}
