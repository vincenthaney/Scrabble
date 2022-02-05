import { Injectable } from '@angular/core';
import { MultiplayerGameConfig } from '@app/classes/communication/game-config';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { GameType } from '@app/classes/game-type';
import { IPlayer } from '@app/classes/player';
import { BoardService, RoundManagerService } from '@app/services/';

@Injectable({
    providedIn: 'root',
})
export default class GameService {
    // highScoreService: HighScoreService;
    // gameHistoryService: GameHistoryService;
    // objectiveManagerService: ObjectiveManagerService;
    player1: IPlayer;
    player2: IPlayer;
    gameType: GameType;
    dictionnaryName: string;
    private gameId: string;

    constructor(private boardService: BoardService, private roundManagerService: RoundManagerService) {}

    initializeMultiplayerGame(gameId: string, multiplayerGameConfig: MultiplayerGameConfig) {
        this.gameId = gameId;
        this.player1 = multiplayerGameConfig.player1;
        this.player2 = multiplayerGameConfig.player2;
        this.gameType = multiplayerGameConfig.gameType;
        this.dictionnaryName = multiplayerGameConfig.dictionaryName;
        this.roundManagerService.maxRoundTime = multiplayerGameConfig.maxRoundTime;
    }

    handleGameUpdate(gameUpdateData: GameUpdateData): void {
        if (gameUpdateData.player1) {
            this.player1.updatePlayerData(gameUpdateData.player1);
        }
        if (gameUpdateData.player2) {
            this.player2.updatePlayerData(gameUpdateData.player2);
        }
        if (gameUpdateData.board) {
            this.boardService.updateBoard(gameUpdateData.board);
        }
        if (gameUpdateData.round) {
            this.roundManagerService.updateRound(gameUpdateData.round);
        }
        if (gameUpdateData.isGameOver) {
            this.gameOver();
        }
        throw new Error('Method not implemented.');
    }

    getGameId(): string {
        return this.gameId;
    }

    getLocalPlayer(): IPlayer {
        return this.player1;
    }

    gameOver(): boolean {
        throw new Error('Method not implemented.');
    }

    sendScores(): void {
        throw new Error('Method not implemented.');
    }

    // TODO: Maybe rename to sendGame or sendFinishedGame
    sendGameHistory(): void {
        throw new Error('Method not implemented.');
    }
}
