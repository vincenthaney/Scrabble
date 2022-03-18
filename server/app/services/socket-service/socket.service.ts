// Required for signature overload
/* eslint-disable no-dupe-class-members */

import { HttpException } from '@app/classes/http.exception';
import { INVALID_ID_FOR_SOCKET, SOCKET_SERVICE_NOT_INITIALIZED } from '@app/constants/services-errors';
import { IS_ID_VIRTUAL_PLAYER } from '@app/constants/virtual-player-constants';
import * as http from 'http';
import { StatusCodes } from 'http-status-codes';
import * as io from 'socket.io';
import { Service } from 'typedi';
import {
    CanceledGameEmitArgs,
    CleanupEmitArgs,
    GameUpdateEmitArgs,
    HighScoresEmitArgs,
    JoinerLeaveGameEmitArgs,
    JoinRequestEmitArgs,
    LobbiesUpdateEmitArgs,
    NewMessageEmitArgs,
    RejectEmitArgs,
    SocketEmitEvents,
    StartGameEmitArgs,
} from './socket-types';

@Service()
export class SocketService {
    private sio?: io.Server;
    private sockets: Map<string, io.Socket>;

    constructor() {
        this.sockets = new Map();
    }

    initialize(server: http.Server): void {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        if (this.sio === undefined) throw new Error(SOCKET_SERVICE_NOT_INITIALIZED);

        this.sio.on('connection', (socket) => {
            this.sockets.set(socket.id, socket);
            socket.emit('initialization', { id: socket.id });

            socket.on('disconnect', () => {
                this.sockets.delete(socket.id);
            });
        });
    }

    addToRoom(socketId: string, room: string): void {
        if (this.sio === undefined) throw new Error(SOCKET_SERVICE_NOT_INITIALIZED);
        const socket = this.getSocket(socketId);
        socket.join(room);
    }

    removeFromRoom(socketId: string, room: string): void {
        if (this.sio === undefined) throw new Error(SOCKET_SERVICE_NOT_INITIALIZED);
        const socket = this.getSocket(socketId);
        socket.leave(room);
    }

    deleteRoom(roomName: string): void {
        if (this.sio === undefined) throw new Error(SOCKET_SERVICE_NOT_INITIALIZED);
        this.sio.sockets.in(roomName).socketsLeave(roomName);
    }

    doesRoomExist(roomName: string): boolean {
        if (this.sio === undefined) throw new Error(SOCKET_SERVICE_NOT_INITIALIZED);
        return this.sio.sockets.adapter.rooms.get(roomName) !== undefined;
    }

    emitToRoom(id: string, ev: 'gameUpdate', ...args: GameUpdateEmitArgs[]): void;
    emitToRoom(id: string, ev: 'joinRequest', ...args: JoinRequestEmitArgs[]): void;
    emitToRoom(id: string, ev: 'startGame', ...args: StartGameEmitArgs[]): void;
    emitToRoom(id: string, ev: 'canceledGame', ...args: CanceledGameEmitArgs[]): void;
    emitToRoom(id: string, ev: 'rejected', ...args: RejectEmitArgs[]): void;
    emitToRoom(id: string, ev: 'lobbiesUpdate', ...args: LobbiesUpdateEmitArgs[]): void;
    emitToRoom(id: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToRoom(id: string, ev: '_test_event', ...args: unknown[]): void;
    emitToRoom<T>(room: string, ev: SocketEmitEvents, ...args: T[]): void {
        if (this.sio === undefined) throw new Error(SOCKET_SERVICE_NOT_INITIALIZED);

        this.sio.to(room).emit(ev, ...args);
    }

    isInitialized(): boolean {
        return this.sio !== undefined;
    }

    getSocket(id: string): io.Socket {
        const socket = this.sockets.get(id);
        if (!socket) throw new HttpException(INVALID_ID_FOR_SOCKET, StatusCodes.BAD_REQUEST);
        return socket;
    }

    emitToSocket(id: string, ev: 'gameUpdate', ...args: GameUpdateEmitArgs[]): void;
    emitToSocket(id: string, ev: 'joinRequest', ...args: JoinRequestEmitArgs[]): void;
    emitToSocket(id: string, ev: 'startGame', ...args: StartGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'canceledGame', ...args: CanceledGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'joinerLeaveGame', ...args: JoinerLeaveGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'rejected', ...args: RejectEmitArgs[]): void;
    emitToSocket(id: string, ev: 'lobbiesUpdate', ...args: LobbiesUpdateEmitArgs[]): void;
    emitToSocket(id: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToSocket(id: string, ev: 'highScoresList', ...args: HighScoresEmitArgs[]): void;
    emitToSocket(id: string, ev: 'cleanup', ...args: CleanupEmitArgs[]): void;
    emitToSocket(id: string, ev: '_test_event', ...args: unknown[]): void;
    emitToSocket<T>(id: string, ev: SocketEmitEvents, ...args: T[]): void {
        if (this.sio === undefined) throw new Error(SOCKET_SERVICE_NOT_INITIALIZED);
        if (IS_ID_VIRTUAL_PLAYER(id)) return;
        this.getSocket(id).emit(ev, ...args);
    }
}
