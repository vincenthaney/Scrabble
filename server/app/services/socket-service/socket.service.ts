// Required for signature overload
/* eslint-disable no-dupe-class-members */

import { HttpException } from '@app/classes/http.exception';
import * as http from 'http';
import { StatusCodes } from 'http-status-codes';
import * as io from 'socket.io';
import { Service } from 'typedi';
import {
    CanceledGameEmitArgs,
    GameUpdateEmitArgs,
    JoinerLeaveGameEmitArgs,
    JoinRequestEmitArgs,
    LobbiesUpdateEmitArgs,
    RejectEmitArgs,
    SocketEmitEvents,
    StartGameEmitArgs,
} from './socket-types';
import * as SocketError from './socket.service.error';

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
    emitToRoom(id: string, ev: 'canceledGame', ...args: CanceledGameEmitArgs[]): void;
    emitToRoom(id: string, ev: 'rejected', ...args: RejectEmitArgs[]): void;
    emitToRoom(id: string, ev: 'lobbiesUpdate', ...args: LobbiesUpdateEmitArgs[]): void;
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
    emitToSocket(id: string, ev: 'canceledGame', ...args: CanceledGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'joinerLeaveGame', ...args: JoinerLeaveGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'rejected', ...args: RejectEmitArgs[]): void;
    emitToSocket(id: string, ev: 'lobbiesUpdate', ...args: LobbiesUpdateEmitArgs[]): void;
    emitToSocket(id: string, ev: '_test_event', ...args: unknown[]): void;
    emitToSocket<T>(id: string, ev: SocketEmitEvents, ...args: T[]): void {
        if (this.sio === undefined) throw new Error(SocketError.SOCKET_SERVICE_NOT_INITIALIZED);
        // eslint-disable-next-line no-console
        console.log(args);
        this.getSocket(id).emit(ev, args);
    }
}
