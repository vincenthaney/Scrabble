// Required for signature overload
/* eslint-disable no-dupe-class-members */

import { Service } from 'typedi';
import * as io from 'socket.io';
import * as http from 'http';
import * as SocketError from './socket.service.error';
import { HttpException } from '@app/classes/http.exception';
import { StatusCodes } from 'http-status-codes';
import { GameUpdateEmitArgs, JoinRequestEmitArgs, RejectEmitArgs, SocketEmitEvents, StartGameEmitArgs } from './socket-types';

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

            socket.emit('initialization', { id: socket.id });

            socket.on('disconnect', () => {
                this.sockets.delete(socket.id);
            });
        });
    }

    addToRoom(socketId: string, room: string) {
        if (this.sio === undefined) throw new Error(SocketError.SOCKET_SERVICE_NOT_INITIALIZED);

        const socket = this.getSocket(socketId);
        socket.join(room);
    }

    deleteRoom(room: string) {
        if (this.sio === undefined) throw new Error(SocketError.SOCKET_SERVICE_NOT_INITIALIZED);

        this.sio.sockets.in(room).socketsLeave(room);
    }

    emitToRoom(id: string, ev: 'gameUpdate', ...args: GameUpdateEmitArgs[]): void;
    emitToRoom(id: string, ev: 'joinRequest', ...args: JoinRequestEmitArgs[]): void;
    emitToRoom(id: string, ev: 'startGame', ...args: StartGameEmitArgs[]): void;
    emitToRoom(id: string, ev: 'rejected', ...args: RejectEmitArgs[]): void;
    emitToRoom(id: string, ev: '_test_event', ...args: unknown[]): void;
    emitToRoom<T>(room: string, ev: SocketEmitEvents, ...args: T[]) {
        if (this.sio === undefined) throw new Error(SocketError.SOCKET_SERVICE_NOT_INITIALIZED);

        this.sio.to(room).emit(ev, args);
    }

    isInitialized(): boolean {
        return this.sio !== undefined;
    }

    getSocket(id: string): io.Socket {
        const socket = this.sockets.get(id);
        if (!socket) throw new HttpException(SocketError.INVALID_ID_FOR_SOCKET, StatusCodes.BAD_REQUEST);
        return socket;
    }

    emitToSocket(id: string, ev: 'gameUpdate', ...args: GameUpdateEmitArgs[]): void;
    emitToSocket(id: string, ev: 'joinRequest', ...args: JoinRequestEmitArgs[]): void;
    emitToSocket(id: string, ev: 'startGame', ...args: StartGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'rejected', ...args: RejectEmitArgs[]): void;
    emitToSocket(id: string, ev: '_test_event', ...args: unknown[]): void;
    emitToSocket<T>(id: string, ev: SocketEmitEvents, ...args: T[]): void {
        if (this.sio === undefined) throw new Error(SocketError.SOCKET_SERVICE_NOT_INITIALIZED);

        this.getSocket(id).emit(ev, args);
    }
}
