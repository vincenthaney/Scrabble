import Board from '@app/classes/board/board';
import Player from '@app/classes/player/player';
import RoundManager from '@app/classes/round/round-manager';
import TileReserve from '@app/classes/tile/tile-reserve';
import * as Errors from '@app/constants/errors';
import BoardService from '@app/services/board/board.service';
import { MultiplayerGameConfig } from './game-config';
import { START_TILES_AMOUNT } from './game.const';
import { GameType } from './game.type';

export const GAME_OVER_PASS_THRESHOLD = 6;

export default class Game {
    private static boardService: BoardService;
    player1: Player;
    player2: Player;
    roundManager: RoundManager;
    wordsPlayed: string[];
    gameType: GameType;
    tileReserve: TileReserve;
    board: Board;
    private id: string;

    static getBoardService(): BoardService {
        return Game.boardService;
    }

    static injectServices(boardService: BoardService): void {
        if (!Game.getBoardService()) {
            Game.boardService = boardService;
        }
    }

    /**
     * Create a game from MultiplayerConfig
     *
     * @constructor
     * @param {MultiplayerGameConfig} config game configuration
     * @returns {Game} game
     */

    static async createMultiplayerGame(id: string, config: MultiplayerGameConfig): Promise<Game> {
        const game = new Game();

        game.id = id;
        game.player1 = config.player1;
        game.player2 = config.player2;
        game.roundManager = new RoundManager(config.maxRoundTime, config.player1, config.player2);
        game.wordsPlayed = [];
        game.gameType = config.gameType;
        game.tileReserve = new TileReserve();
        game.board = this.boardService.initializeBoard();

        await game.tileReserve.init();

        game.player1.tiles = game.tileReserve.getTiles(START_TILES_AMOUNT);
        game.player2.tiles = game.tileReserve.getTiles(START_TILES_AMOUNT);

        game.roundManager.nextRound();

        return game;
    }

    /**
     * Create a game from SoloGameConfig
     *
     * @constructor
     * @param {SoloGameConfig} config game configuration
     * @returns {Game} game
     */

    static async createSoloGame(/* config: SoloGameConfig */): Promise<Game> {
        throw new Error('Solo mode not implemented');
    }

    getId() {
        return this.id;
    }

    /**
     * Get the player with id
     *
     * @param {string} playerId id
     * @returns {Player} player with id
     */

    getRequestingPlayer(playerId: string): Player {
        if (this.player1.getId() === playerId) return this.player1;
        if (this.player2.getId() === playerId) return this.player2;
        throw new Error(Errors.INVALID_PLAYER_ID_FOR_GAME);
    }

    /**
     * Get the opponent of the player with id
     *
     * @param {string} playerId id
     * @returns {Player} opponent
     */

    getOpponentPlayer(playerId: string): Player {
        if (this.player1.getId() === playerId) return this.player2;
        if (this.player2.getId() === playerId) return this.player1;
        throw new Error(Errors.INVALID_PLAYER_ID_FOR_GAME);
    }

    isGameOver(): boolean {
        return this.player1.tiles.length === 0 || this.player2.tiles.length === 0 || this.roundManager.getPassCounter() >= GAME_OVER_PASS_THRESHOLD;
    }
    }
}
