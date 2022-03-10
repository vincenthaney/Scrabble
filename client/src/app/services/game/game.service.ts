import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { GameUpdateData, PlayerData } from '@app/classes/communication/';
import { StartMultiplayerGameData } from '@app/classes/communication/game-config';
import { Message } from '@app/classes/communication/message';
import { GameType } from '@app/classes/game-type';
import { IResetServiceData } from '@app/classes/i-reset-service-data';
import { AbstractPlayer, Player } from '@app/classes/player';
import { Round } from '@app/classes/round';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { GAME_ID_COOKIE, SOCKET_ID_COOKIE, SYSTEM_ID, TIME_TO_RECONNECT } from '@app/constants/game';
import { MISSING_PLAYER_DATA_TO_INITIALIZE, NO_LOCAL_PLAYER } from '@app/constants/services-errors';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import BoardService from '@app/services/board/board.service';
import { CookieService } from '@app/services/cookie/cookie.service';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import SocketService from '@app/services/socket/socket.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type UpdateTileReserveEventArgs = Required<Pick<GameUpdateData, 'tileReserve' | 'tileReserveTotal'>>;

@Injectable({
    providedIn: 'root',
})
export default class GameService implements OnDestroy, IResetServiceData {
    // highScoreService: HighScoreService;
    // gameHistoryService: GameHistoryService;
    // objectiveManagerService: ObjectiveManagerService;
    player1: AbstractPlayer;
    player2: AbstractPlayer;
    gameType: GameType;
    dictionnaryName: string;
    gameUpdateValue = new BehaviorSubject<GameUpdateData>({});
    newMessageValue = new BehaviorSubject<Message>({
        content: 'Début de la partie',
        senderId: SYSTEM_ID,
    });
    tileReserve: TileReserveData[];
    tileReserveTotal: number;
    updateTileRackEvent: EventEmitter<void>;
    noActiveGameEvent: EventEmitter<void> = new EventEmitter<void>();
    newActivePlayerEvent: EventEmitter<[PlayerData, boolean]> = new EventEmitter<[PlayerData, boolean]>();
    rerenderEvent: EventEmitter<void> = new EventEmitter<void>();
    updateTileReserveEvent: EventEmitter<UpdateTileReserveEventArgs>;
    playingTiles: EventEmitter<ActionPlacePayload>;
    leaveGameSubject: Subject<string>;
    serviceDestroyed$: Subject<boolean> = new Subject();
    gameIsSetUp: boolean;
    isGameOver: boolean;
    gameId: string;
    private localPlayerId: string;

    constructor(
        private router: Router,
        private boardService: BoardService,
        private roundManager: RoundManagerService,
        private gameController: GamePlayController,
        private socketService: SocketService,
        private cookieService: CookieService,
    ) {
        this.updateTileRackEvent = new EventEmitter();
        this.updateTileReserveEvent = new EventEmitter();
        this.gameController.newMessageValue.pipe(takeUntil(this.serviceDestroyed$)).subscribe((newMessage) => this.handleNewMessage(newMessage));
        this.gameController.gameUpdateValue.pipe(takeUntil(this.serviceDestroyed$)).subscribe((newData) => this.handleGameUpdate(newData));
        this.leaveGameSubject = new Subject<string>();
        this.playingTiles = new EventEmitter();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    async initializeMultiplayerGame(localPlayerId: string, startGameData: StartMultiplayerGameData): Promise<void> {
        this.gameId = startGameData.gameId;
        this.localPlayerId = localPlayerId;
        this.player1 = this.initializePlayer(startGameData.player1);
        this.player2 = this.initializePlayer(startGameData.player2);
        this.gameType = startGameData.gameType;
        this.dictionnaryName = startGameData.dictionary;
        this.roundManager.gameId = startGameData.gameId;
        this.roundManager.localPlayerId = this.localPlayerId;
        this.roundManager.maxRoundTime = startGameData.maxRoundTime;
        this.roundManager.currentRound = this.roundManager.convertRoundDataToRound(startGameData.round);
        this.tileReserve = startGameData.tileReserve;
        this.tileReserveTotal = startGameData.tileReserveTotal;
        this.boardService.initializeBoard(startGameData.board);
        this.gameIsSetUp = true;
        this.isGameOver = false;
        if (this.router.url !== '/game') {
            this.roundManager.initialize();
            this.roundManager.startRound(startGameData.maxRoundTime);
            await this.router.navigateByUrl('game');
        } else {
            this.reconnectReinitialize(startGameData);
        }
    }

    reconnectReinitialize(startGameData: StartMultiplayerGameData): void {
        this.player1.updatePlayerData(startGameData.player1);
        this.player2.updatePlayerData(startGameData.player2);
        this.rerenderEvent.emit();
        this.updateTileRackEvent.emit();
        this.updateTileReserveEvent.emit({ tileReserve: startGameData.tileReserve, tileReserveTotal: startGameData.tileReserveTotal });
        this.boardService.updateBoard(([] as Square[]).concat(...startGameData.board));
        this.roundManager.continueRound(this.roundManager.currentRound);
    }

    initializePlayer(playerData: PlayerData): AbstractPlayer {
        if (!playerData.id || !playerData.name || !playerData.tiles) throw new Error(MISSING_PLAYER_DATA_TO_INITIALIZE);
        return new Player(playerData.id, playerData.name, playerData.tiles);
    }

    handleGameUpdate(gameUpdateData: GameUpdateData): void {
        if (gameUpdateData.player1) {
            this.player1.updatePlayerData(gameUpdateData.player1);
            this.updateTileRackEvent.emit();
        }
        if (gameUpdateData.player2) {
            this.player2.updatePlayerData(gameUpdateData.player2);
            this.updateTileRackEvent.emit();
        }
        if (gameUpdateData.board) {
            this.boardService.updateBoard(gameUpdateData.board);
        }
        if (gameUpdateData.round) {
            const round: Round = this.roundManager.convertRoundDataToRound(gameUpdateData.round);
            this.roundManager.updateRound(round);
            const newActivePlayer: PlayerData = gameUpdateData.round.playerData;
            this.newActivePlayerEvent.emit([newActivePlayer, this.isLocalPlayerPlaying()]);
        }
        if (gameUpdateData.tileReserve && gameUpdateData.tileReserveTotal !== undefined) {
            this.tileReserve = gameUpdateData.tileReserve;
            this.tileReserveTotal = gameUpdateData.tileReserveTotal;
            this.updateTileReserveEvent.emit({ tileReserve: gameUpdateData.tileReserve, tileReserveTotal: gameUpdateData.tileReserveTotal });
        }
        if (gameUpdateData.isGameOver) {
            this.gameOver();
        }
    }

    updateGameUpdateData(newData: GameUpdateData): void {
        this.gameUpdateValue.next(newData);
    }

    handleNewMessage(newMessage: Message): void {
        this.newMessageValue.next(newMessage);
    }

    getPlayingPlayerId(): string {
        return this.roundManager.getActivePlayer().id;
    }

    isLocalPlayerPlaying(): boolean {
        return this.getPlayingPlayerId() === this.localPlayerId;
    }

    getGameId(): string {
        return this.gameId;
    }

    getLocalPlayer(): AbstractPlayer | undefined {
        if (!this.localPlayerId) return undefined;
        return this.player1.id === this.localPlayerId ? this.player1 : this.player2;
    }

    getLocalPlayerId(): string | undefined {
        if (!this.localPlayerId) return undefined;
        return this.player1.id === this.localPlayerId ? this.player1.id : this.player2.id;
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
            this.noActiveGameEvent.emit();
        }
    }

    disconnectGame(): void {
        const gameId = this.gameId;
        const localPlayerId = this.getLocalPlayerId();
        this.gameId = '';
        this.player1.id = '';
        this.player2.id = '';
        this.localPlayerId = '';
        if (!localPlayerId) throw new Error(NO_LOCAL_PLAYER);
        this.cookieService.setCookie(GAME_ID_COOKIE, gameId, TIME_TO_RECONNECT);
        this.cookieService.setCookie(SOCKET_ID_COOKIE, localPlayerId, TIME_TO_RECONNECT);
        this.gameController.handleDisconnection(gameId, localPlayerId);
    }

    resetServiceData(): void {
        this.player1 = undefined as unknown as AbstractPlayer;
        this.player2 = undefined as unknown as AbstractPlayer;
        this.gameType = undefined as unknown as GameType;
        this.dictionnaryName = '';
        this.tileReserve = [];
        this.tileReserveTotal = 0;
        this.isGameOver = false;
        this.gameId = '';
        this.localPlayerId = '';
    }
}
