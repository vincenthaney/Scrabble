import { Action, ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
// import { HttpException } from '@app/classes/http.exception';
import { Service } from 'typedi';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
// import { SocketService } from '@app/services/socket-service/socket.service';

const INVALID_COMMAND = 'The command is not one of the recognised commands. type !help for a list of possible commands';
const NOT_PLAYER_TURN = 'It is not the turn of requesting player';

@Service()
export class GamePlayService {
    // constructor(private readonly activeGameService: ActiveGameService, private readonly socketService: SocketService) {}
    constructor(private readonly activeGameService: ActiveGameService) {}

    // playAction(gameId: string, playerId: string, action: Action) {  //GameUpdateData {
    playAction(gameId: string, playerId: string, actionData: ActionData): GameUpdateData {
        const game = this.activeGameService.getGame(gameId, playerId);
        const currentPlayer = game.getCurrentPlayer();
        if (currentPlayer.getId() !== playerId) throw Error(NOT_PLAYER_TURN);

        let action: Action;
        switch (actionData.type) {
            case 'place': {
                action = new ActionPlace(actionData.payload.tiles, actionData.payload.position, actionData.payload.orientation);
                break;
            }
            case 'exchange': {
                action = new ActionExchange(actionData.payload.tiles);
                break;
            }
            case 'pass': {
                action = new ActionPass();
                break;
            }
            default: {
                throw Error(INVALID_COMMAND);
            }
        }
        const updatedData = action.execute(game, game.getRequestingPlayer(playerId));
        if (action.willEndTurn()) {
            game.roundManager.nextRound();
        }
        if (game.isGameOver()) {
            //
        }
        return updatedData;
        // const opponentId = game.getOpponentPlayer(playerId).getId();
        // this.socketService.getSocket(playerId).emit('event', 'args');
        // this.socketService.getSocket(opponentId).emit('event', 'args');
    }
}
