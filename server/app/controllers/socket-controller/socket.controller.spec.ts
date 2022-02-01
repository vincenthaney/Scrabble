/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Server } from '@app/server';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as chaiAsPromised from 'chai-as-promised';
import { Container } from 'typedi';
import * as io from 'socket.io';
import { io as ioClient, Socket } from 'socket.io-client';
import { SocketService } from '@app/services/socket-service/socket.service';
import { delay } from '@app/utils/delay';
import { SocketController } from './socket.controller';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const SERVER_URL = 'http://localhost:';
const RESPONSE_DELAY = 200;

const KEY_ON = 'test-receive';
const KEY_EMIT = 'test-emit';
const DEFAULT_MESSAGE = 'default message';

class MockController extends SocketController {
    configureSocket(): void {
        this.on(KEY_ON, this.handleTestReceive);
    }

    handleTestReceive(args: { message: string }) {
        // eslint-disable-next-line no-console
        this.emit(KEY_EMIT, { message: args.message });
    }
}

describe('SocketController', () => {
    let controller: SocketController;
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

        controller = new MockController(serverSocket);
    });

    afterEach(() => {
        clientSocket.close();
        socketService['sio']?.close();
    });

    it('should create', () => {
        expect(controller).to.exist;
    });

    it('should call "on" on socket', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const spy = chai.spy.on(serverSocket, 'on', () => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        controller.on(KEY_ON, () => {});
        expect(spy).to.have.been.called();
    });

    it('should call "emit" on socket', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const spy = chai.spy.on(serverSocket, 'emit', () => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        controller.emit(KEY_EMIT, DEFAULT_MESSAGE);
        expect(spy).to.have.been.called();
    });

    it('should handle event when called', async () => {
        return new Promise((resolve) => {
            const arg = { message: DEFAULT_MESSAGE };
            clientSocket.on(KEY_EMIT, (args: { message: string }) => {
                expect(args.message).to.equal(DEFAULT_MESSAGE);
                resolve();
            });
            clientSocket.emit(KEY_ON, arg);
        });
    });

    it('should emit to client', async () => {
        return new Promise((resolve) => {
            const arg = { message: DEFAULT_MESSAGE };
            clientSocket.on(KEY_EMIT, (args: { message: string }) => {
                expect(args.message).to.equal(DEFAULT_MESSAGE);
                resolve();
            });
            serverSocket.emit(KEY_EMIT, arg);
        });
    });
});
