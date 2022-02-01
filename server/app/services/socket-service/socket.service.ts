import { Service } from 'typedi';
import * as io from 'socket.io';
import * as http from 'http';
import * as SocketError from './socket.service.error';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';

@Service()
export class SocketService {
    private sio?: io.Server;
    private sockets: Map<string, io.Socket>;

    constructor() {
        this.sockets = new Map();
    }

    initialize(server: http.Server) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        if (this.sio === undefined) throw new Error(SocketError.SOCKET_SERVICE_NOT_INITIALIZED);

        this.sio.on('connection', (socket) => {
            this.sockets.set(socket.id, socket);

            socket.emit('initialization', {
                id: socket.id,
            });

            socket.on('disconnect', () => {
                this.sockets.delete(socket.id);
            });

            new GameDispatcherController(socket);
            new GamePlayController(socket);
        });
    }

    getSocket(id: string): io.Socket {
        const socket = this.sockets.get(id);

        if (socket) return socket;
        throw new Error(SocketError.INVALID_ID_FOR_SOCKET);
    }

    isInitialized(): boolean {
        return this.sio !== undefined;
    }
}
