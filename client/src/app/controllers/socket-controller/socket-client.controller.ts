import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

export abstract class SocketController {
    private socket: Socket;

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

    abstract configureSocket(): void;
}
