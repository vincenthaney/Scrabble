/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { INVALID_ID_FOR_SOCKET } from '@app/constants/services-errors';
import { Delay } from '@app/utils/delay';
import { Server } from 'app/server';
import { expect } from 'chai';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketService } from './socket.service';

const RESPONSE_DELAY = 300;
const SERVER_URL = 'http://localhost:';

const DEFAULT_ROOM = 'default_room';

const getSocketId = async (socket: Socket) => {
    const DELAY = 5;
    const MAX_DELAY = 500;

    let i = 0;
    while (socket.id === undefined) {
        await Delay.for(DELAY);
        if (i * DELAY > MAX_DELAY) throw new Error('TIMEOUT');
        i++;
    }
    return socket.id;
};

describe('SocketService', () => {
    describe('Initialized', () => {
        let service: SocketService;
        let server: Server;
        let clientSocket: Socket;

        beforeEach(() => {
            server = Container.get(Server);
            server.init();
            service = server['socketService'];
            clientSocket = ioClient(SERVER_URL + Server['appPort']);
            service.handleSockets();
        });

        afterEach(() => {
            clientSocket.close();
            service['sio']?.close();
        });

        it('should create', () => {
            expect(service).to.exist;
        });

        it('should initialize', () => {
            expect(service.isInitialized()).to.be.true;
        });

        it('should add to the socket map on connect', async () => {
            service.handleSockets();
            clientSocket.connect();
            await Delay.for(RESPONSE_DELAY); // Wait until the server socket received connection.
            expect(service['sockets'].get(clientSocket.id)).to.exist;
        });

        it('should emit initializationn on connect', async () => {
            return new Promise((resolve) => {
                clientSocket.on('initialization', (res: { id: string }) => {
                    expect(res).to.ownProperty('id');
                    resolve();
                });
                clientSocket.connect();
            });
        });

        describe('getSocket', () => {
            let id: string;

            beforeEach(async () => {
                clientSocket.connect();
                id = await getSocketId(clientSocket);
            });

            afterEach(() => {
                clientSocket.disconnect();
            });

            it('should find socket when connected', () => {
                expect(service.getSocket(id)).to.exist;
            });

            it('should throw when id is invalid', () => {
                const invalidId = 'invalidId';
                expect(invalidId).to.not.equal(id);
                expect(() => service.getSocket(invalidId)).to.throw(INVALID_ID_FOR_SOCKET);
            });
        });

        describe('addToRoom', () => {
            let id: string;
            beforeEach(async () => {
                clientSocket.connect();
                id = await getSocketId(clientSocket);
            });

            afterEach(() => {
                clientSocket.disconnect();
            });

            it('should add it to the room', () => {
                expect(service.getSocket(id).rooms.has(DEFAULT_ROOM)).to.be.false;
                service.addToRoom(id, DEFAULT_ROOM);
                expect(service.getSocket(id).rooms.has(DEFAULT_ROOM)).to.be.true;
            });
        });

        describe('deleteRoom', () => {
            let id: string;
            beforeEach(async () => {
                clientSocket.connect();
                id = await getSocketId(clientSocket);
            });

            afterEach(() => {
                clientSocket.disconnect();
            });

            it('should remove it from the room', () => {
                service.addToRoom(id, DEFAULT_ROOM);
                expect(service.getSocket(id).rooms.has(DEFAULT_ROOM)).to.be.true;
                service.deleteRoom(DEFAULT_ROOM);
                expect(service.getSocket(id).rooms.has(DEFAULT_ROOM)).to.be.false;
                expect(service['sio']?.sockets.adapter.rooms.has(DEFAULT_ROOM)).to.be.false;
            });
        });
    });
});
