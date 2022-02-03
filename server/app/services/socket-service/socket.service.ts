import { Service } from 'typedi';
import * as io from 'socket.io';
import * as http from 'http';
import * as SocketError from './socket.service.error';
import { HttpException } from '@app/classes/http.exception';
import { StatusCodes } from 'http-status-codes';
@Service()
export class SocketService {
    sio?: io.Server;
    private map: Map<string, io.Socket>;

    constructor() {
        this.map = new Map();
    }

    initialize(server: http.Server) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        if (this.sio === undefined) throw new Error(SocketError.SOCKET_SERVICE_NOT_INITIALIZED);

        this.sio.on('connection', (socket) => {
            this.map.set(socket.id, socket);

            // eslint-disable-next-line no-console
            console.log('new socket', socket.id);

            socket.emit('initialization', { id: socket.id });
            socket.on('disconnect', () => {
                this.map.delete(socket.id);
            });
        });
    }

    addToRoom(socketId: string, room: string) {
        if (this.sio === undefined) throw new Error(SocketError.SOCKET_SERVICE_NOT_INITIALIZED);

        const socket = this.getSocket(socketId);
        socket.join(room);
    }

    deleteRoom(room: string) {
        if (this.sio === undefined) throw new HttpException(SocketError.SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.BAD_REQUEST);

        this.sio.sockets.in(room).socketsLeave(room);
    }

    isInitialized(): boolean {
        return this.sio !== undefined;
    }

    getSocket(id: string): io.Socket {
        const socket = this.map.get(id);
        if (!socket) throw new HttpException(SocketError.INVALID_ID_FOR_SOCKET, StatusCodes.BAD_REQUEST);
        return socket;
    }
}
