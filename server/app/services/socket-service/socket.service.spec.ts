/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { SocketService } from './socket.service';
import { Server } from 'app/server';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { delay } from '@app/utils/delay';
import * as SocketError from './socket.service.error';

const RESPONSE_DELAY = 200;
const SERVER_URL = 'http://localhost:';

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
            await clientSocket.connect();
            await delay(RESPONSE_DELAY); // Wait until the server socket received connection.
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
                await clientSocket.connect();
                await delay(RESPONSE_DELAY);
                id = clientSocket.id;
            });

            it('should find socket when connected', () => {
                expect(service.getSocket(id)).to.exist;
            });

            it('should throw when id is invalid', () => {
                const invalidId = 'invalidId';
                expect(invalidId).to.not.equal(id);
                expect(() => service.getSocket(invalidId)).to.throw(SocketError.INVALID_ID_FOR_SOCKET);
            });
        });
    });

    describe('Not initialized', () => {
        let service: SocketService;

        beforeEach(async () => {
            service = new SocketService();
        });

        describe('handleSockets', () => {
            it('should throw', () => {
                expect(() => service.handleSockets()).to.throw(SocketError.SOCKET_SERVICE_NOT_INITIALIZED);
            });
        });
    });
});
