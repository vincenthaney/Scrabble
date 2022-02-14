import { ActionData } from '@app/classes/communication/action-data';
import Game from '@app/classes/game/game';
import { MultiplayerGameConfig, StartMultiplayerGameData } from '@app/classes/game/game-config';
import { HttpException } from '@app/classes/http.exception';
import Player from '@app/classes/player/player';
import { INVALID_PLAYER_ID_FOR_GAME, NO_GAME_FOUND_WITH_ID } from '@app/constants/services-errors';
import BoardService from '@app/services/board/board.service';
import { EventEmitter } from 'events';
import { Service } from 'typedi';

@Service()
export class ActiveGameService {
    playerLeftEvent: EventEmitter;
    private activeGames: Game[];

    constructor(private boardService: BoardService) {
        this.playerLeftEvent = new EventEmitter();
        this.activeGames = [];
        Game.injectServices(this.boardService);
    }

    async beginMultiplayerGame(id: string, config: MultiplayerGameConfig): Promise<StartMultiplayerGameData> {
        const game = await Game.createMultiplayerGame(id, config);
        this.activeGames.push(game);
        return game.createStartGameData();
    }

    getGame(id: string, playerId: string): Game {
        const filteredGames = this.activeGames.filter((g) => g.getId() === id);

        if (filteredGames.length === 0) throw new HttpException(NO_GAME_FOUND_WITH_ID);

        const game = filteredGames[0];
        if (game.player1.getId() !== playerId && game.player2.getId() !== playerId) throw new HttpException(INVALID_PLAYER_ID_FOR_GAME);

        return game;
    }

    remove(id: string, playerId: string): Game {
        const game = this.getGame(id, playerId);
        const index = this.activeGames.indexOf(game);
        this.activeGames.splice(index, 1);
        return game;
    }

    isGameOver(gameId: string, playerId: string): boolean {
        return this.getGame(gameId, playerId).isGameOver();
    }

    forcePlayerLose(gameId: string, playerId: string): ActionData {
        const game = this.getGame(gameId, playerId);
        const playerLost: Player = game.player1.getId() === playerId ? game.player1 : game.player2;
        playerLost.forceLost();

        return {
            type: 'pass',
            payload: {},
            input: '',
        };
    }
}
