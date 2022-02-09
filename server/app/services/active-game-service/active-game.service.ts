import Game from '@app/classes/game/game';
import { MultiplayerGameConfig } from '@app/classes/game/game-config';
import * as Errors from '@app/constants/errors';
import { HttpException } from '@app/classes/http.exception';
import BoardService from '@app/services/board/board.service';
import { Service } from 'typedi';

@Service()
export class ActiveGameService {
    private activeGames: Game[];

    constructor(private boardService: BoardService) {
        this.activeGames = [];
        Game.injectServices(this.boardService);
    }

    async beginMultiplayerGame(id: string, config: MultiplayerGameConfig): Promise<Game> {
        const game = await Game.createMultiplayerGame(id, config);
        this.activeGames.push(game);
        return game;
    }

    getGame(id: string, playerId: string): Game {
        const filteredGames = this.activeGames.filter((g) => g.getId() === id);

        if (filteredGames.length === 0) throw new HttpException(Errors.NO_GAME_FOUND_WITH_ID);

        const game = filteredGames[0];
        if (game.player1.getId() !== playerId && game.player2.getId() !== playerId) throw new HttpException(Errors.INVALID_PLAYER_ID_FOR_GAME);

        return game;
    }

    remove(id: string, playerId: string): Game {
        const game = this.getGame(id, playerId);
        const index = this.activeGames.indexOf(game);
        this.activeGames.splice(index, 1);
        return game;
    }
}
