import Board from '@app/classes/board/board';
import Player from '@app/classes/player/player';
import RoundManager from '@app/classes/round/round-manager';
import TileReserve from '@app/classes/tile/tile-reserve';
import * as Errors from '@app/constants/errors';
import BoardService from '@app/services/board/board.service';
import { MultiplayerGameConfig } from './game-config';
import { START_TILES_AMOUNT, SYSTEM_MESSAGE_ID } from './game.const';
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
    dictionnaryName: string;
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

    getId() {
        return this.id;
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
        return !this.player1.hasTilesLeft() || !this.player2.hasTilesLeft() || this.roundManager.getPassCounter() >= GAME_OVER_PASS_THRESHOLD;
    }

    endOfGame() {
        if (this.roundManager.getPassCounter() >= GAME_OVER_PASS_THRESHOLD) {
            this.player1.score -= this.player1.getTileRackPoints();
            this.player2.score -= this.player2.getTileRackPoints();
        } else if (!this.player1.hasTilesLeft()) {
            this.player1.score += this.player2.getTileRackPoints();
            this.player2.score -= this.player2.getTileRackPoints();
        } else if (!this.player2.hasTilesLeft()) {
            this.player1.score -= this.player1.getTileRackPoints();
            this.player2.score += this.player1.getTileRackPoints();
        }
    }

    // TODO: RETURN LES MESSAGES ET EMIT A ???
    endGameMessage() {
        // const message1 = { content: 'Fin de partie - lettres restantes', senderId: SYSTEM_MESSAGE_ID };
        // const message2 = { content: this.player1.endGameMessage(), senderId: SYSTEM_MESSAGE_ID };
        // const message3 = { content: this.player2.endGameMessage(), senderId: SYSTEM_MESSAGE_ID };
        // const message4 = this.congratulateWinner();
    }

    // TODO: USE MATHILDE MESSAGE
    congratulateWinner(): { content: string; senderId: string } {
        let winner: string;
        if (this.player1.score > this.player2.score) {
            winner = this.player1.name;
        } else if (this.player1.score < this.player2.score) {
            winner = this.player2.name;
        } else {
            winner = this.player1.name + ' et ' + this.player2.name;
        }
        return { content: `Félicatations à ${winner} pour votre victoire!`, senderId: SYSTEM_MESSAGE_ID };
    }

    isPlayer1(arg: string | Player): boolean {
        if (arg instanceof Player) {
            return this.player1.getId() === arg.getId();
        } else {
            return this.player1.getId() === arg;
        }
    }
}
