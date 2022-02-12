import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import * as SOCKET_ERROR from './socket.service.error';

const CONNECTION_DELAY = 5;
const CONNECTION_TIMEOUT = 5000;
@Injectable({
    providedIn: 'root',
})
export default class SocketService {
    private socket: Socket;

    async initializeService(): Promise<void> {
        this.connect();
        return this.waitForConnection(() => this.isSocketAlive(), CONNECTION_DELAY, CONNECTION_TIMEOUT);
    }

    async waitForConnection(predicate: () => boolean, delay: number, timeout: number): Promise<void> {
        return new Promise((resolve, reject) => {
            let connectionTime = 0;
            const interval = setInterval(() => {
                if (predicate()) {
                    clearInterval(interval);
                    resolve();
                } else {
                    connectionTime += delay;
                    if (connectionTime >= timeout) {
                        reject();
                    }
                }
            }, delay);
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
