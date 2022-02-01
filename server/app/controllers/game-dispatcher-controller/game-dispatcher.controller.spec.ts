/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Server } from '@app/server';
import { expect } from 'chai';
import { GameDispatcherController } from './game-dispatcher.controller';
import { Container } from 'typedi';
import * as io from 'socket.io';
import { io as ioClient, Socket } from 'socket.io-client';
import { SocketService } from '@app/services/socket-service/socket.service';
import { delay } from '@app/utils/delay';

const SERVER_URL = 'http://localhost:';
const RESPONSE_DELAY = 200;

describe('GameDispatcherController', () => {
    let controller: GameDispatcherController;
    let server: Server;
    let socketService: SocketService;
    let clientSocket: Socket;
    let serverSocket: io.Socket;

    beforeEach(async () => {
        server = Container.get(Server);
        server.init();
        clientSocket = ioClient(SERVER_URL + Server['appPort']);
        socketService = server['socketService'];
        socketService.handleSockets();

        await clientSocket.connect();
        await delay(RESPONSE_DELAY); // Wait until the server socket received connection.
        serverSocket = socketService.getSocket(clientSocket.id);

        controller = new GameDispatcherController(serverSocket);
    });

    afterEach(() => {
        clientSocket.close();
        socketService['sio']?.close();
    });

    it('should create', () => {
        expect(controller).to.exist;
    });
});
