import { Injectable } from '@angular/core';
import { StartMultiplayerGameData } from '@app/classes/communication/game-config';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { Message } from '@app/classes/communication/message';
import { GameType } from '@app/classes/game-type';
import { IPlayer } from '@app/classes/player';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { BoardService } from '@app/services/';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { BehaviorSubject } from 'rxjs';

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
    gameUpdateValue = new BehaviorSubject<GameUpdateData>({});
    newMessageValue = new BehaviorSubject<Message>({
        content: 'Début de la partie',
        senderId: 'System',
        date: new Date(),
    });
    private gameId: string;
    private localPlayerId: string;

    constructor(private boardService: BoardService, private roundManager: RoundManagerService, private gameController: GamePlayController) {
        this.gameController.newMessageValue.subscribe((newMessage) => this.handleNewMessage(newMessage));
        this.gameController.gameUpdateValue.subscribe((newData) => this.handleGameUpdate(newData));
    }

    initializeMultiplayerGame(localPlayerId: string, startGameData: StartMultiplayerGameData) {
        this.gameId = startGameData.gameId;
        this.localPlayerId = localPlayerId;
        this.player1 = startGameData.player1;
        this.player2 = startGameData.player2;
        this.gameType = startGameData.gameType;
        this.dictionnaryName = startGameData.dictionary;
        this.roundManager.maxRoundTime = startGameData.maxRoundTime;
        this.roundManager.currentRound = startGameData.round;
        this.boardService.initializeBoard(startGameData.board);
        this.roundManager.startRound();
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
            this.roundManager.updateRound(gameUpdateData.round);
        }
        if (gameUpdateData.isGameOver) {
            this.gameOver();
        }
    }

    updateGameUpdateData(newData: GameUpdateData) {
        this.gameUpdateValue.next(newData);
    }

    handleNewMessage(newMessage: Message): void {
        this.newMessageValue.next(newMessage);
    }

    updateNewMessage(newMessage: Message) {
        this.newMessageValue.next(newMessage);
    }

    getGameId(): string {
        return this.gameId;
    }

    getLocalPlayer(): IPlayer | undefined {
        if (!this.localPlayerId) return undefined;
        return this.player1.id === this.localPlayerId ? this.player1 : this.player2;
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
