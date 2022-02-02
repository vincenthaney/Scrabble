// import * as io from 'socket.io';
import { SocketController } from '@app/controllers/socket-controller/socket-client.controller';
// import { GamePlayService } from '@app/services/game-play-service/game-play.service';

export class GamePlayController extends SocketController {
    // private readonly gamePlayService: GamePlayService;

    // constructor(socket: io.Socket, gamePlayService: GamePlayService) {
    //     super(socket);
    //     this.gamePlayService = gamePlayService;
    // }

    configureSocket(): void {
        // this.on('play-action', this.handlePlayAction);
    }

    // handlePlayAction(arg: PlayActionArg) {
    //     // ...
    // }
}
