import Board from '@app/classes/board/board';
import Player from '@app/classes/player/player';
import RoundManager from '@app/classes/round/round-manager';
import TileReserve from '@app/classes/tile/tile-reserve';
import BoardService from '@app/services/board/board.service';
import { LetterValue, Tile } from '@app/classes/tile';
import { MultiplayerGameConfig } from './game-config';
import { GameInfoData } from './game-info';
import { START_TILES_AMOUNT, END_GAME_HEADER_MESSAGE } from '@app/constants/classes-constants';
import { GameType } from './game.type';
import { INVALID_PLAYER_ID_FOR_GAME } from '@app/constants/services-errors';

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

    static winnerMessage(winner: string): string {
        return `Félicitations à ${winner} pour votre victoire!`;
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
        if (this.player1.id === playerId) return this.player1;
        if (this.player2.id === playerId) return this.player2;
        throw new Error(INVALID_PLAYER_ID_FOR_GAME);
    }

    getOpponentPlayer(playerId: string): Player {
        if (this.player1.id === playerId) return this.player2;
        if (this.player2.id === playerId) return this.player1;
        throw new Error(INVALID_PLAYER_ID_FOR_GAME);
    }

    isGameOver(): boolean {
        return !this.player1.hasTilesLeft() || !this.player2.hasTilesLeft() || this.roundManager.getPassCounter() >= GAME_OVER_PASS_THRESHOLD;
    }

    endOfGame(): [number, number] {
        if (this.roundManager.getPassCounter() >= GAME_OVER_PASS_THRESHOLD) {
            this.player1.score -= this.player1.getTileRackPoints();
            this.player2.score -= this.player2.getTileRackPoints();
        } else if (!this.player1.hasTilesLeft()) {
            this.player1.score += this.player2.getTileRackPoints();
            this.player2.score -= this.player2.getTileRackPoints();
        } else {
            this.player1.score -= this.player1.getTileRackPoints();
            this.player2.score += this.player1.getTileRackPoints();
        }

        return [this.player1.score, this.player2.score];
    }

    endGameMessage(): string[] {
        return [END_GAME_HEADER_MESSAGE, this.player1.endGameMessage(), this.player2.endGameMessage(), this.congratulateWinner()];
    }

    congratulateWinner(): string {
        let winner: string;
        if (this.player1.score > this.player2.score) {
            winner = this.player1.name;
        } else if (this.player1.score < this.player2.score) {
            winner = this.player2.name;
        } else {
            winner = this.player1.name + ' et ' + this.player2.name;
        }
        return Game.winnerMessage(winner);
    }

    isPlayer1(arg: string | Player): boolean {
        if (arg instanceof Player) {
            return this.player1.id === arg.id;
        } else {
            return this.player1.id === arg;
        }
    }
    getInfoData(): GameInfoData {
        return {
            player1: this.player1,
            player2: this.player2,
            round: this.roundManager.getCurrentRound(),
            board: this.board.grid,
            isGameOver: this.isGameOver(),
        };
    }
}
