import Game from '@app/classes/game/game';
import { MultiplayerGameConfig, StartMultiplayerGameData } from '@app/classes/game/game-config';
import { HttpException } from '@app/classes/http.exception';
import { INVALID_PLAYER_ID_FOR_GAME, NO_GAME_FOUND_WITH_ID } from '@app/constants/services-errors';
import BoardService from '@app/services/board/board.service';
import { Service } from 'typedi';

@Service()
export class ActiveGameService {
    private activeGames: Game[];

    constructor(private boardService: BoardService) {
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

    // removePlayerFromGame(gameId: string, playerId: string): void {
    //     const game = this.getGame(gameId, playerId);
    //     // if (game.player1.getId() === playerId) {
    //     // }
    // }
}
