import Board from '@app/classes/board/board';
import Player from '@app/classes/player/player';
import RoundManager from '@app/classes/round/round-manager';
import TileReserve from '@app/classes/tile/tile-reserve';
import * as Errors from '@app/constants/errors';
import BoardService from '@app/services/board/board.service';
import { LetterValue, Tile } from '@app/classes/tile';
import { MultiplayerGameConfig } from './game-config';
import { START_TILES_AMOUNT } from './game.const';
import { GameType } from './game.type';

export const GAME_OVER_PASS_THRESHOLD = 6;

export default class Game {
    private static boardService: BoardService;
    roundManager: RoundManager;
    // Not used yet, for future features
    wordsPlayed: string[];
    gameType: GameType;
    board: Board;
    dictionnaryName: string;
    player1: Player;
    player2: Player;
    private tileReserve: TileReserve;
    private id: string;

    static getBoardService(): BoardService {
        return Game.boardService;
    }

    static injectServices(boardService: BoardService): void {
        if (!Game.getBoardService()) {
            Game.boardService = boardService;
        }
    }

    static async createMultiplayerGame(id: string, config: MultiplayerGameConfig): Promise<Game> {
        const game = new Game();

        game.id = id;
        game.player1 = config.player1;
        game.player2 = config.player2;
        game.roundManager = new RoundManager(config.maxRoundTime, config.player1, config.player2);
        game.wordsPlayed = [];
        game.gameType = config.gameType;
        game.dictionnaryName = config.dictionary;
        game.tileReserve = new TileReserve();
        game.board = this.boardService.initializeBoard();

        await game.tileReserve.init();

        game.player1.tiles = game.tileReserve.getTiles(START_TILES_AMOUNT);
        game.player2.tiles = game.tileReserve.getTiles(START_TILES_AMOUNT);

        game.roundManager.beginRound();

        return game;
    }

    static async createSoloGame(/* config: SoloGameConfig */): Promise<Game> {
        throw new Error('Solo mode not implemented');
    }

    getTilesFromReserve(amount: number): Tile[] {
        return this.tileReserve.getTiles(amount);
    }

    swapTilesFromReserve(tilesToSwap: Tile[]): Tile[] {
        return this.tileReserve.swapTiles(tilesToSwap);
    }

    getTilesLeftPerLetter(): Map<LetterValue, number> {
        return this.tileReserve.getTilesLeftPerLetter();
    }

    getId() {
        return this.id;
    }

    async initTileReserve() {
        return this.tileReserve.init();
    }

    getRequestingPlayer(playerId: string): Player {
        if (this.player1.getId() === playerId) return this.player1;
        if (this.player2.getId() === playerId) return this.player2;
        throw new Error(Errors.INVALID_PLAYER_ID_FOR_GAME);
    }

    getOpponentPlayer(playerId: string): Player {
        if (this.player1.getId() === playerId) return this.player2;
        if (this.player2.getId() === playerId) return this.player1;
        throw new Error(Errors.INVALID_PLAYER_ID_FOR_GAME);
    }

    isGameOver(): boolean {
        return this.player1.tiles.length === 0 || this.player2.tiles.length === 0 || this.roundManager.getPassCounter() >= GAME_OVER_PASS_THRESHOLD;
    }

    isPlayer1(arg: string | Player): boolean {
        if (arg instanceof Player) {
            return this.player1.getId() === arg.getId();
        } else {
            return this.player1.getId() === arg;
        }
    }
}
