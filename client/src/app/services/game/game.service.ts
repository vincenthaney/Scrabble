import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameUpdateData, PlayerData } from '@app/classes/communication/';
import { StartMultiplayerGameData } from '@app/classes/communication/game-config';
import { Message } from '@app/classes/communication/message';
import { GameType } from '@app/classes/game-type';
import { IResetServiceData } from '@app/classes/i-reset-service-data';
import { AbstractPlayer } from '@app/classes/player';
import { PlayerContainer } from '@app/classes/player/player-container';
import { Round } from '@app/classes/round';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { GAME_ID_COOKIE, SOCKET_ID_COOKIE, TIME_TO_RECONNECT } from '@app/constants/game';
import { NO_LOCAL_PLAYER } from '@app/constants/services-errors';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import BoardService from '@app/services/board/board.service';
import { CookieService } from '@app/services/cookie/cookie.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager/game-view-event-manager.service';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import SocketService from '@app/services/socket/socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export default class GameService implements OnDestroy, IResetServiceData {
    // highScoreService: HighScoreService;
    // gameHistoryService: GameHistoryService;
    // objectiveManagerService: ObjectiveManagerService;
    playerContainer: PlayerContainer;
    gameType: GameType;
    dictionnaryName: string;
    tileReserve: TileReserveData[];
    tileReserveTotal: number;

    gameIsSetUp: boolean;
    isGameOver: boolean;
    gameId: string;

    private serviceDestroyed$: Subject<boolean>;

    constructor(
        private router: Router,
        private boardService: BoardService,
        private roundManager: RoundManagerService,
        private gameController: GamePlayController,
        private socketService: SocketService,
        private cookieService: CookieService,
        private gameViewEventManagerService: GameViewEventManagerService,
    ) {
        this.serviceDestroyed$ = new Subject();
        this.gameController.newMessageValue.pipe(takeUntil(this.serviceDestroyed$)).subscribe((newMessage) => this.handleNewMessage(newMessage));
        this.gameController.gameUpdateValue.pipe(takeUntil(this.serviceDestroyed$)).subscribe((newData) => this.handleGameUpdate(newData));
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    async initializeMultiplayerGame(localPlayerId: string, startGameData: StartMultiplayerGameData): Promise<void> {
        this.gameId = startGameData.gameId;
        this.playerContainer = new PlayerContainer(localPlayerId).initializePlayers(startGameData.player1, startGameData.player2);
        this.gameType = startGameData.gameType;
        this.dictionnaryName = startGameData.dictionary;
        this.roundManager.initialize(localPlayerId, startGameData);
        this.tileReserve = startGameData.tileReserve;
        this.tileReserveTotal = startGameData.tileReserveTotal;
        this.boardService.initializeBoard(startGameData.board);
        this.gameIsSetUp = true;
        this.isGameOver = false;

        await this.handleReroute(startGameData);
    }

    async handleReroute(startGameData: StartMultiplayerGameData): Promise<void> {
        if (this.router.url !== '/game') {
            this.roundManager.initializeEvents();
            this.roundManager.startRound();
            await this.router.navigateByUrl('game');
        } else {
            this.reconnectReinitialize(startGameData);
        }
    }

    reconnectReinitialize(startGameData: StartMultiplayerGameData): void {
        this.playerContainer.updatePlayersData(startGameData.player1, startGameData.player2);
        this.gameViewEventManagerService.emitGameViewEvent('reRender');
        this.gameViewEventManagerService.emitGameViewEvent('tileRackUpdate');
        this.gameViewEventManagerService.emitGameViewEvent('tileReserveUpdate', {
            tileReserve: startGameData.tileReserve,
            tileReserveTotal: startGameData.tileReserveTotal,
        });
        this.boardService.updateBoard(([] as Square[]).concat(...startGameData.board));
        this.roundManager.continueRound(this.roundManager.currentRound);
    }

    handleGameUpdate(gameUpdateData: GameUpdateData): void {
        if (gameUpdateData.player1) {
            this.handleUpdatePlayerData(gameUpdateData.player1);
        }
        if (gameUpdateData.player2) {
            this.handleUpdatePlayerData(gameUpdateData.player2);
        }
        if (gameUpdateData.board) {
            this.boardService.updateBoard(gameUpdateData.board);
        }
        if (gameUpdateData.round) {
            const round: Round = this.roundManager.convertRoundDataToRound(gameUpdateData.round);
            this.roundManager.updateRound(round);
        }
        if (gameUpdateData.tileReserve && gameUpdateData.tileReserveTotal !== undefined) {
            this.handleTileReserveUpdate(gameUpdateData.tileReserve, gameUpdateData.tileReserveTotal);
        }
        if (gameUpdateData.isGameOver) {
            this.gameOver();
        }
    }

    handleUpdatePlayerData(playerData: PlayerData): void {
        this.playerContainer.updatePlayersData(playerData);
        this.gameViewEventManagerService.emitGameViewEvent('tileRackUpdate');
    }

    handleTileReserveUpdate(tileReserve: TileReserveData[], tileReserveTotal: number): void {
        this.tileReserve = tileReserve;
        this.tileReserveTotal = tileReserveTotal;
        this.gameViewEventManagerService.emitGameViewEvent('tileReserveUpdate', {
            tileReserve,
            tileReserveTotal,
        });
    }

    handleNewMessage(newMessage: Message): void {
        this.gameViewEventManagerService.emitGameViewEvent('newMessage', newMessage);
    }

    getPlayingPlayerId(): string {
        return this.roundManager.getActivePlayer().id;
    }

    isLocalPlayerPlaying(): boolean {
        return this.getPlayingPlayerId() === this.playerContainer.getLocalPlayerId();
    }

    getGameId(): string {
        return this.gameId;
    }

    getPlayerByNumber(playerNumber: number): AbstractPlayer {
        return this.playerContainer.getPlayer(playerNumber);
    }

    getLocalPlayer(): AbstractPlayer | undefined {
        return this.playerContainer.getLocalPlayer();
    }

    getLocalPlayerId(): string | undefined {
        return this.playerContainer.getIdOfLocalPlayer();
    }

    gameOver(): void {
        this.isGameOver = true;
        this.roundManager.resetTimerData();
    }

    reconnectGame(): void {
        const gameIdCookie = this.cookieService.getCookie(GAME_ID_COOKIE);
        const socketIdCookie = this.cookieService.getCookie(SOCKET_ID_COOKIE);

        if (gameIdCookie !== '' && gameIdCookie.length > 0) {
            this.cookieService.eraseCookie(GAME_ID_COOKIE);
            this.cookieService.eraseCookie(SOCKET_ID_COOKIE);

            this.gameController.handleReconnection(gameIdCookie, socketIdCookie, this.socketService.getId());
        } else {
            this.gameViewEventManagerService.emitGameViewEvent('noActiveGame');
        }
    }

    disconnectGame(): void {
        const gameId = this.gameId;
        const localPlayerId = this.getLocalPlayerId();
        this.gameId = '';
        this.playerContainer.resetPlayers();
        if (!localPlayerId) throw new Error(NO_LOCAL_PLAYER);
        this.cookieService.setCookie(GAME_ID_COOKIE, gameId, TIME_TO_RECONNECT);
        this.cookieService.setCookie(SOCKET_ID_COOKIE, localPlayerId, TIME_TO_RECONNECT);
        this.gameController.handleDisconnection(gameId, localPlayerId);
    }

    resetServiceData(): void {
        this.playerContainer.resetPlayers();
        this.gameType = undefined as unknown as GameType;
        this.dictionnaryName = '';
        this.tileReserve = [];
        this.tileReserveTotal = 0;
        this.isGameOver = false;
        this.gameId = '';
    }
}
