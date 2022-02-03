import * as io from 'socket.io';

export abstract class SocketController {
    private socket: io.Socket;

    constructor(socket: io.Socket) {
        this.socket = socket;

        this.configureSocket();
    }

    on<T>(ev: string, handler: (arg: T) => void) {
        this.socket.on(ev, handler);
    }

    emit<T>(ev: string, ...args: T[]) {
        this.socket.emit(ev, args);
    }

    abstract configureSocket(): void;
}
