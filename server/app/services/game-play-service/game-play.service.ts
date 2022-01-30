import { Action } from '@app/classes/actions';
import { Service } from 'typedi';
// import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
// import { SocketService } from '@app/services/socket-service/socket.service';

@Service()
export class GamePlayService {
    // constructor(private readonly activeGameService: ActiveGameService, private readonly socketService: SocketService) {}

    // eslint-disable-next-line no-unused-vars
    playAction(gameId: string, playerId: string, action: Action) {
        throw new Error('Method not implemented');
        // const game = this.activeGameService.getGame(gameId, playerId);
        // const opponentId = game.getOpponentPlayer(playerId).getId();
        // this.socketService.getSocket(playerId).emit('event', 'args');
        // this.socketService.getSocket(opponentId).emit('event', 'args');
    }
}
