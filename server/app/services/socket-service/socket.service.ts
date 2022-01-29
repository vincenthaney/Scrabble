import { Service } from 'typedi';
import * as io from 'socket.io';
import * as http from 'http';
import { GameConfigData } from '@app/classes/game/game-config';
import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';

@Service()
export class SocketService {
    private sio?: io.Server;
    private sockets: Map<string, io.Socket>;

    constructor(private gameDispatcherService: GameDispatcherService) {
        this.sockets = new Map();
    }

    initialize(server: http.Server) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        if (!this.isInitialized()) throw new Error('SocketService not initialized');

        this.sio?.on('connection', (socket) => {
            this.sockets.set(socket.id, socket);

            socket.emit('initialization', {
                id: socket.id,
            });

            socket.on('create-game', (config: Omit<GameConfigData, 'playerId'>) => {
                const completeConfig: GameConfigData = {
                    ...config,
                    playerId: socket.id,
                };
                const waitingGame = this.gameDispatcherService.createMultiplayerGame(completeConfig);
                socket.emit('create-game-response', waitingGame);
            });

            socket.on('get-lobby', () => {
                socket.emit('get-lobby-response', this.gameDispatcherService.getAvailableWaitingGames());
            });

            socket.on('disconnect', () => {
                this.sockets.delete(socket.id);
            });
        });
    }

    getSocket(id: string): io.Socket {
        const socket = this.sockets.get(id);

        if (socket) return socket;
        throw new Error('Invalid ID for socket');
    }

    isInitialized(): boolean {
        return this.sio !== undefined;
    }
}
