// import * as io from 'socket.io';
import { SocketController } from '@app/controllers/socket-controller/socket.controller';
// import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';

export class GameDispatcherController extends SocketController {
    // private readonly gameDispatcherService: GameDispatcherService;

    // constructor(socket: io.Socket, gameDispatcherService: GameDispatcherService) {
    //     super(socket);
    //     this.gameDispatcherService = gameDispatcherService;
    // }

    configureSocket(): void {
        // this.on('create-game', this.handlePlayAction);
    }

    // handleCreateGame(arg: CreateGameArg) {
    //     // ...
    // }
}
