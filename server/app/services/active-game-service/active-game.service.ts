import { Service } from 'typedi';
import Game from '@app/classes/game/game';
import { MultiplayerGameConfig } from '@app/classes/game/game-config';
import * as Errors from '@app/constants/errors';

@Service()
export class ActiveGameService {
    private activeGames: Game[];

    constructor() {
        this.activeGames = [];
    }

    /**
     * Creates the game and add it to the active games list
     *
     * @param {MultiplayerGameConfig} config game configuration
     * @returns {Game} created game
     */

    async beginMultiplayerGame(config: MultiplayerGameConfig): Promise<Game> {
        const game = await Game.createMultiplayerGame(config);
        this.activeGames.push(game);
        return game;
    }

    /**
     * Get game from id and playerId
     *
     * @param {string} id game id
     * @param {string} playerId player id
     * @returns {Game} game
     */

    getGame(id: string, playerId: string): Game {
        const filteredGames = this.activeGames.filter((g) => g.getId() === id);

        if (filteredGames.length === 0) throw new Error(Errors.NO_GAME_FOUND_WITH_ID);

        const game = filteredGames[0];
        if (game.player1.getId() !== playerId && game.player2.getId() !== playerId) throw new Error(Errors.INVALID_PLAYER_ID_FOR_GAME);

        return game;
    }

    /**
     * Remove game from active game list
     *
     * @param {string} id game id
     * @param {string} playerId player id
     * @returns {Game} game
     */

    remove(id: string, playerId: string): Game {
        const game = this.getGame(id, playerId);
        const index = this.activeGames.indexOf(game);
        this.activeGames.splice(index, 1);
        return game;
    }
}
