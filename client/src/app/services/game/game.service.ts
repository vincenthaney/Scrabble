import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameUpdateData, PlayerData } from '@app/classes/communication/';
import { InitializeGameData, StartGameData } from '@app/classes/communication/game-config';
import { Message } from '@app/classes/communication/message';
import { GameType } from '@app/classes/game-type';
import { IResetServiceData } from '@app/classes/i-reset-service-data';
import { AbstractPlayer } from '@app/classes/player';
import { PlayerContainer } from '@app/classes/player/player-container';
import { Round } from '@app/classes/round';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { GAME_ID_COOKIE, SOCKET_ID_COOKIE, SYSTEM_ERROR_ID, TIME_TO_RECONNECT } from '@app/constants/game';
import { NO_LOCAL_PLAYER } from '@app/constants/services-errors';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
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
    gameType: GameType;
    dictionaryName: string;
    tileReserve: TileReserveData[];

    isGameSetUp: boolean;
    isGameOver: boolean;

    private gameId: string;
    private playerContainer?: PlayerContainer;
    private serviceDestroyed$: Subject<boolean>;

    constructor(
        private router: Router,
        private boardService: BoardService,
        private roundManager: RoundManagerService,
        private gameDispatcherController: GameDispatcherController,
        private gameController: GamePlayController,
        private socketService: SocketService,
        private cookieService: CookieService,
        private gameViewEventManagerService: GameViewEventManagerService,
    ) {
        this.serviceDestroyed$ = new Subject();
        this.gameDispatcherController.subscribeToInitializeGame(this.serviceDestroyed$, async (initializeValue: InitializeGameData | undefined) =>
            this.handleInitializeGame(initializeValue),
        );
        this.gameController.newMessageValue.pipe(takeUntil(this.serviceDestroyed$)).subscribe((newMessage) => {
            if (newMessage) this.handleNewMessage(newMessage);
        });
        this.gameController.gameUpdateValue.pipe(takeUntil(this.serviceDestroyed$)).subscribe((newData) => this.handleGameUpdate(newData));
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    async handleInitializeGame(initializeGameData: InitializeGameData | undefined): Promise<void> {
        if (!initializeGameData) return;
        return await this.initializeGame(initializeGameData.localPlayerId, initializeGameData.startGameData);
    }

    async initializeGame(localPlayerId: string, startGameData: StartGameData): Promise<void> {
        this.gameId = startGameData.gameId;
        this.playerContainer = new PlayerContainer(localPlayerId).initializePlayers(startGameData.player1, startGameData.player2);
        this.gameType = startGameData.gameType;
        this.dictionaryName = startGameData.dictionary;
        this.tileReserve = startGameData.tileReserve;

        this.roundManager.initialize(localPlayerId, startGameData);
        this.boardService.initializeBoard(startGameData.board);

        this.isGameSetUp = true;
        this.isGameOver = false;

        await this.handleReRouteOrReconnect(startGameData);
    }

    async handleReRouteOrReconnect(startGameData: StartGameData): Promise<void> {
        if (this.router.url !== '/game') {
            this.roundManager.initializeEvents();
            this.roundManager.startRound();
            await this.router.navigateByUrl('game');
        } else {
            this.reconnectReinitialize(startGameData);
        }
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
        if (gameUpdateData.tileReserve) {
            this.handleTileReserveUpdate(gameUpdateData.tileReserve);
        }
        if (gameUpdateData.isGameOver) {
            this.handleGameOver();
        }
    }

    handleUpdatePlayerData(playerData: PlayerData): void {
        if (this.playerContainer) {
            this.playerContainer.updatePlayersData(playerData);
        }
        this.gameViewEventManagerService.emitGameViewEvent('tileRackUpdate');
    }

    handleTileReserveUpdate(tileReserve: TileReserveData[]): void {
        this.tileReserve = [...tileReserve];
    }

    handleNewMessage(newMessage: Message): void {
        this.gameViewEventManagerService.emitGameViewEvent('newMessage', newMessage);
        if (newMessage.senderId === SYSTEM_ERROR_ID) this.gameViewEventManagerService.emitGameViewEvent('usedTiles', undefined);
    }

    getPlayingPlayerId(): string {
        return this.roundManager.getActivePlayer().id;
    }

    isLocalPlayerPlaying(): boolean {
        if (!this.playerContainer) return false;
        return this.getPlayingPlayerId() === this.playerContainer.getLocalPlayerId();
    }

    getGameId(): string {
        return this.gameId;
    }

    resetGameId(): void {
        this.gameId = '';
    }

    getPlayerByNumber(playerNumber: number): AbstractPlayer | undefined {
        if (!this.playerContainer) return undefined;
        return this.playerContainer.getPlayer(playerNumber);
    }

    getLocalPlayer(): AbstractPlayer | undefined {
        if (!this.playerContainer) return undefined;
        return this.playerContainer.getLocalPlayer();
    }

    getLocalPlayerId(): string | undefined {
        if (!this.playerContainer) return undefined;
        return this.playerContainer.getLocalPlayerId();
    }

    getTotalNumberOfTilesLeft(): number {
        if (!this.tileReserve) return 0;
        return this.tileReserve.reduce((prev, { amount }) => prev + amount, 0);
    }

    handleGameOver(): void {
        this.isGameOver = true;
        this.roundManager.resetTimerData();
    }

    resetServiceData(): void {
        this.gameType = undefined as unknown as GameType;
        this.dictionaryName = '';
        this.tileReserve = [];
        this.isGameOver = false;
        this.gameId = '';
        this.playerContainer = undefined;
    }

    reconnectReinitialize(startGameData: StartGameData): void {
        if (this.playerContainer) {
            this.playerContainer.updatePlayersData(startGameData.player1, startGameData.player2);
        }
        this.gameViewEventManagerService.emitGameViewEvent('reRender');
        this.gameViewEventManagerService.emitGameViewEvent('tileRackUpdate');
        this.boardService.updateBoard(([] as Square[]).concat(...startGameData.board));
        this.roundManager.continueRound(this.roundManager.currentRound);
    }

    reconnectGame(): void {
        const gameIdCookie: string = this.cookieService.getCookie(GAME_ID_COOKIE);
        const socketIdCookie: string = this.cookieService.getCookie(SOCKET_ID_COOKIE);

        if (this.isGameIdCookieAbsent(gameIdCookie)) {
            this.gameViewEventManagerService.emitGameViewEvent('noActiveGame');
            return;
        }
        this.cookieService.eraseCookie(GAME_ID_COOKIE);
        this.cookieService.eraseCookie(SOCKET_ID_COOKIE);

        this.gameController.handleReconnection(gameIdCookie, socketIdCookie, this.socketService.getId());
    }

    disconnectGame(): void {
        const gameId = this.gameId;
        const localPlayerId = this.getLocalPlayerId();
        this.resetServiceData();

        if (!localPlayerId) throw new Error(NO_LOCAL_PLAYER);
        this.cookieService.setCookie(GAME_ID_COOKIE, gameId, TIME_TO_RECONNECT);
        this.cookieService.setCookie(SOCKET_ID_COOKIE, localPlayerId, TIME_TO_RECONNECT);
        this.gameController.handleDisconnection(gameId, localPlayerId);
    }

    private isGameIdCookieAbsent(gameIdCookie: string): boolean {
        return gameIdCookie === '' && gameIdCookie.length <= 0;
    }
}
