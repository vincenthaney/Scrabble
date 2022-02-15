/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameUpdateData, PlayerData } from '@app/classes/communication';
import { StartMultiplayerGameData } from '@app/classes/communication/game-config';
import { Message } from '@app/classes/communication/message';
import { GameType } from '@app/classes/game-type';
import { AbstractPlayer, Player } from '@app/classes/player';
import { Round } from '@app/classes/round';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { MISSING_PLAYER_DATA_TO_INITIALIZE } from '@app/constants/services-errors';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { BoardService, GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { BehaviorSubject, Subject } from 'rxjs';
import SpyObj = jasmine.SpyObj;

const DEFAULT_PLAYER_ID = 'cov-id';
const DEFAULT_SQUARE: Omit<Square, 'position'> = { tile: null, scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_GRID_SIZE = 8;
const DEFAULT_PLAYER_1 = { name: 'phineas', id: 'id-1', score: 0, tiles: [] };
const DEFAULT_PLAYER_2 = { name: 'ferb', id: 'id-2', score: 0, tiles: [] };

@Component({
    template: '',
})
class TestComponent {}

describe('GameService', () => {
    let service: GameService;
    let boardServiceSpy: SpyObj<BoardService>;
    let roundManagerSpy: SpyObj<RoundManagerService>;
    let gameDispatcherControllerSpy: SpyObj<GameDispatcherController>;

    beforeEach(() => {
        boardServiceSpy = jasmine.createSpyObj('BoardService', ['initializeBoard', 'updateBoard']);
        roundManagerSpy = jasmine.createSpyObj('RoundManagerService', ['convertRoundDataToRound', 'startRound', 'updateRound', 'getActivePlayer']);
        gameDispatcherControllerSpy = jasmine.createSpyObj('GameDispatcherController', ['']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: 'game', component: TestComponent }])],
            providers: [
                { provide: BoardService, useValue: boardServiceSpy },
                { provide: RoundManagerService, useValue: roundManagerSpy },
                { provide: GameDispatcherController, useValue: gameDispatcherControllerSpy },
            ],
        });
        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('ngOnDestroy', () => {
        let serviceDestroyed$py: SpyObj<Subject<boolean>>;

        beforeEach(() => {
            serviceDestroyed$py = jasmine.createSpyObj('Subject', ['next', 'complete']);
            service.serviceDestroyed$ = serviceDestroyed$py;
        });

        it('should call serviceDestroyed$.next', () => {
            service.ngOnDestroy();
            expect(serviceDestroyed$py.next).toHaveBeenCalledOnceWith(true);
        });

        it('should call serviceDestroyed$.complete', () => {
            service.ngOnDestroy();
            expect(serviceDestroyed$py.complete).toHaveBeenCalled();
        });
    });

    describe('initializeMultiplayerGame', () => {
        let defaultGameData: StartMultiplayerGameData;

        beforeEach(() => {
            defaultGameData = {
                player1: DEFAULT_PLAYER_1,
                player2: DEFAULT_PLAYER_2,
                gameType: GameType.Classic,
                maxRoundTime: 1,
                dictionary: 'default',
                gameId: 'game-id',
                board: new Array(DEFAULT_GRID_SIZE).map((_, y) => {
                    return new Array(DEFAULT_GRID_SIZE).map((__, x) => ({ ...DEFAULT_SQUARE, position: { row: y, column: x } }));
                }),
                tileReserve: [],
                tileReserveTotal: 0,
                round: {
                    playerData: DEFAULT_PLAYER_1,
                    startTime: new Date(),
                    limitTime: new Date(),
                    completedTime: null,
                },
            };
        });

        it('should set gameId', async () => {
            expect(service.getGameId()).not.toBeDefined();
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(service.getGameId()).toEqual(defaultGameData.gameId);
        });

        it('should set local player id', async () => {
            expect(service['localPlayerId']).not.toBeDefined();
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(service['localPlayerId']).toEqual(DEFAULT_PLAYER_ID);
        });

        it('should call initializePlayer twice', async () => {
            const spy = spyOn(service, 'initializePlayer');
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(spy).toHaveBeenCalledWith(DEFAULT_PLAYER_1);
            expect(spy).toHaveBeenCalledWith(defaultGameData.player2);
        });

        it('should set player 1', async () => {
            expect(service.player1).not.toBeDefined();
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(service.player1).toBeDefined();
        });

        it('should set player 2', async () => {
            expect(service.player2).not.toBeDefined();
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(service.player2).toBeDefined();
        });

        it('should set gameType', async () => {
            expect(service.gameType).not.toBeDefined();
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(service.gameType).toEqual(defaultGameData.gameType);
        });

        it('should set dictionnaryName', async () => {
            expect(service.dictionnaryName).not.toBeDefined();
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(service.dictionnaryName).toEqual(defaultGameData.dictionary);
        });

        it('should set roundManager.gameId', async () => {
            expect(service['roundManager'].gameId).not.toBeDefined();
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(service['roundManager'].gameId).toEqual(defaultGameData.gameId);
        });

        it('should set roundManager.gameId', async () => {
            expect(service['roundManager'].localPlayerId).not.toBeDefined();
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(service['roundManager'].localPlayerId).toEqual(DEFAULT_PLAYER_ID);
        });

        it('should set roundManager.maxRoundTime', async () => {
            expect(service['roundManager'].maxRoundTime).not.toBeDefined();
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(service['roundManager'].maxRoundTime).toEqual(defaultGameData.maxRoundTime);
        });

        it('should call convertRoundData to round', async () => {
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(roundManagerSpy.convertRoundDataToRound).toHaveBeenCalledWith(defaultGameData.round);
        });

        it('should set tileReserve', async () => {
            expect(service.tileReserve).not.toBeDefined();
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(service.tileReserve).toEqual(defaultGameData.tileReserve);
        });

        it('should set tileReserveTotal', async () => {
            expect(service.tileReserveTotal).not.toBeDefined();
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(service.tileReserveTotal).toEqual(defaultGameData.tileReserveTotal);
        });

        it('should call initializeBoard', async () => {
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(boardServiceSpy.initializeBoard).toHaveBeenCalledWith(defaultGameData.board);
        });

        it('should call startRound', async () => {
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(roundManagerSpy.startRound).toHaveBeenCalled();
        });

        it('should call navigateByUrl', async () => {
            const spy = spyOn(service['router'], 'navigateByUrl');
            await service.initializeMultiplayerGame(DEFAULT_PLAYER_ID, defaultGameData);
            expect(spy).toHaveBeenCalledWith('game');
        });
    });

    describe('initializePlayer', () => {
        it('should create player', () => {
            const result = service.initializePlayer(DEFAULT_PLAYER_1);

            expect(result.id).toEqual(DEFAULT_PLAYER_1.id!);
            expect(result.name).toEqual(DEFAULT_PLAYER_1.name!);
            expect(result.tiles).toEqual(DEFAULT_PLAYER_1.tiles!);
            expect(result.score).toEqual(0);
        });

        it('should throw if id is undefined', () => {
            const player: Omit<PlayerData, 'id'> = { name: DEFAULT_PLAYER_1.name, tiles: DEFAULT_PLAYER_1.tiles };
            expect(() => service.initializePlayer(player)).toThrowError(MISSING_PLAYER_DATA_TO_INITIALIZE);
        });

        it('should throw if name is undefined', () => {
            const player: Omit<PlayerData, 'name'> = { id: DEFAULT_PLAYER_1.id, tiles: DEFAULT_PLAYER_1.tiles };
            expect(() => service.initializePlayer(player)).toThrowError(MISSING_PLAYER_DATA_TO_INITIALIZE);
        });

        it('should throw if tiles is undefined', () => {
            const player: Omit<PlayerData, 'tiles'> = { id: DEFAULT_PLAYER_1.id, name: DEFAULT_PLAYER_1.name };
            expect(() => service.initializePlayer(player)).toThrowError(MISSING_PLAYER_DATA_TO_INITIALIZE);
        });
    });

    describe('handleGameUpdate', () => {
        let gameUpdateData: GameUpdateData;
        let updateTileRackEventEmitSpy: jasmine.Spy;
        let updateTileReserveEventEmitSpy: jasmine.Spy;

        beforeEach(() => {
            gameUpdateData = {};

            service.player1 = new Player(DEFAULT_PLAYER_1.id, DEFAULT_PLAYER_1.name, DEFAULT_PLAYER_1.tiles);
            service.player2 = new Player(DEFAULT_PLAYER_2.id, DEFAULT_PLAYER_2.name, DEFAULT_PLAYER_2.tiles);

            service.updateTileRackEvent = new EventEmitter();
            updateTileRackEventEmitSpy = spyOn(service.updateTileRackEvent, 'emit');
            service.updateTileReserveEvent = new EventEmitter();
            updateTileReserveEventEmitSpy = spyOn(service.updateTileReserveEvent, 'emit');
        });

        it('should call updatePlayerDate and emit with player1 if defined', () => {
            const spy = spyOn(service.player1, 'updatePlayerData');
            gameUpdateData.player1 = DEFAULT_PLAYER_1;
            service.handleGameUpdate(gameUpdateData);
            expect(spy).toHaveBeenCalledWith(DEFAULT_PLAYER_1);
            expect(updateTileRackEventEmitSpy).toHaveBeenCalled();
        });

        it('should not call updatePlayerDate and emit with player1 if undefined', () => {
            const spy = spyOn(service.player1, 'updatePlayerData');
            service.handleGameUpdate(gameUpdateData);
            expect(spy).not.toHaveBeenCalledWith(DEFAULT_PLAYER_1);
            expect(updateTileRackEventEmitSpy).not.toHaveBeenCalled();
        });

        it('should call updatePlayerDate and emit with player2 if defined', () => {
            const spy = spyOn(service.player2, 'updatePlayerData');
            gameUpdateData.player2 = DEFAULT_PLAYER_2;
            service.handleGameUpdate(gameUpdateData);
            expect(spy).toHaveBeenCalledWith(DEFAULT_PLAYER_2);
            expect(updateTileRackEventEmitSpy).toHaveBeenCalled();
        });

        it('should not call updatePlayerDate and emit with player2 if undefined', () => {
            const spy = spyOn(service.player2, 'updatePlayerData');
            service.handleGameUpdate(gameUpdateData);
            expect(spy).not.toHaveBeenCalledWith(DEFAULT_PLAYER_2);
            expect(updateTileRackEventEmitSpy).not.toHaveBeenCalled();
        });

        it('should call updateBoard if board is defined', () => {
            gameUpdateData.board = [];
            service.handleGameUpdate(gameUpdateData);
            expect(boardServiceSpy.updateBoard).toHaveBeenCalledWith(gameUpdateData.board);
        });

        it('should not call updateBoard if board is undefined', () => {
            service.handleGameUpdate(gameUpdateData);
            expect(boardServiceSpy.updateBoard).not.toHaveBeenCalled();
        });

        it('should call convertRoundDataToRound and updateRound if round is defined', () => {
            const round: Round = { player: service.player1, startTime: new Date(), limitTime: new Date(), completedTime: null };
            roundManagerSpy.convertRoundDataToRound.and.returnValue(round);
            gameUpdateData.round = { playerData: DEFAULT_PLAYER_1, startTime: new Date(), limitTime: new Date(), completedTime: null };
            service.handleGameUpdate(gameUpdateData);
            expect(roundManagerSpy.convertRoundDataToRound).toHaveBeenCalled();
            expect(roundManagerSpy.updateRound).toHaveBeenCalledWith(round);
        });

        it('should not call convertRoundDataToRound and updateRound if round is defined', () => {
            const round: Round = { player: service.player1, startTime: new Date(), limitTime: new Date(), completedTime: null };
            roundManagerSpy.convertRoundDataToRound.and.returnValue(round);
            service.handleGameUpdate(gameUpdateData);
            expect(roundManagerSpy.convertRoundDataToRound).not.toHaveBeenCalled();
            expect(roundManagerSpy.updateRound).not.toHaveBeenCalledWith(round);
        });

        it('should update tileReserve, tileReserveTotal and emit if tileReserve and tilReserveTotal are defined', () => {
            service.tileReserve = [];
            service.tileReserveTotal = -1;

            gameUpdateData.tileReserve = [];
            gameUpdateData.tileReserveTotal = 0;
            service.handleGameUpdate(gameUpdateData);

            expect(service.tileReserve).toEqual(gameUpdateData.tileReserve);
            expect(service.tileReserveTotal).toEqual(gameUpdateData.tileReserveTotal);
            expect(updateTileReserveEventEmitSpy).toHaveBeenCalled();
        });

        it('should not update tileReserve, tileReserveTotal and emit if tileReserve or tilReserveTotal are undefined', () => {
            const originalTileReserve: TileReserveData[] = [];
            const originalTileReserveTotal = -1;
            service.tileReserve = originalTileReserve;
            service.tileReserveTotal = originalTileReserveTotal;

            gameUpdateData.tileReserve = undefined;
            gameUpdateData.tileReserveTotal = undefined;
            service.handleGameUpdate(gameUpdateData);

            expect(service.tileReserve).toEqual(originalTileReserve);
            expect(service.tileReserveTotal).toEqual(originalTileReserveTotal);
            expect(updateTileReserveEventEmitSpy).not.toHaveBeenCalled();
        });

        it('should call gameOver if gameOver', () => {
            const spy = spyOn(service, 'gameOver');
            gameUpdateData.isGameOver = true;
            service.handleGameUpdate(gameUpdateData);
            expect(spy).toHaveBeenCalled();
        });

        it('should not call gameOver if gameOver is false or undefined', () => {
            const spy = spyOn(service, 'gameOver');
            service.handleGameUpdate(gameUpdateData);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('updateGameUpdateData', () => {
        it('should call gameUpdateValue next', () => {
            service.gameUpdateValue = new BehaviorSubject({});
            const spy = spyOn(service.gameUpdateValue, 'next');
            service.updateGameUpdateData({});
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleNewMessage', () => {
        it('should call newMessageValue next', () => {
            service.newMessageValue = new BehaviorSubject({} as Message);
            const spy = spyOn(service.newMessageValue, 'next');
            service.handleNewMessage({} as Message);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('getPlayingPlayerId', () => {
        it('should return id or round manager active player', () => {
            const expected = 'expected-id';
            roundManagerSpy.getActivePlayer.and.returnValue({ id: expected } as AbstractPlayer);
            const result = service.getPlayingPlayerId();
            expect(result).toEqual(expected);
        });
    });

    describe('isLocalPlayerPlaying', () => {
        it('should return true if is local player', () => {
            const expected = 'expected-id';
            roundManagerSpy.getActivePlayer.and.returnValue({ id: expected } as AbstractPlayer);
            service['localPlayerId'] = expected;
            const result = service.isLocalPlayerPlaying();
            expect(result).toBeTrue();
        });

        it('should return false if is not local player', () => {
            const expected = 'expected-id';
            roundManagerSpy.getActivePlayer.and.returnValue({ id: expected } as AbstractPlayer);
            service['localPlayerId'] = 'not-expected-id';
            const result = service.isLocalPlayerPlaying();
            expect(result).toBeFalse();
        });
    });

    describe('getGameId', () => {
        it('should return gameId', () => {
            const expected = 'expected-id';
            service['gameId'] = expected;
            expect(service.getGameId()).toEqual(expected);
        });
    });

    describe('getLocalPlayer and getLocalPlayerId', () => {
        let player1: Player;
        let player2: Player;

        beforeEach(() => {
            player1 = new Player(DEFAULT_PLAYER_1.id, DEFAULT_PLAYER_1.name, DEFAULT_PLAYER_1.tiles);
            player2 = new Player(DEFAULT_PLAYER_2.id, DEFAULT_PLAYER_2.name, DEFAULT_PLAYER_2.tiles);

            service.player1 = player1;
            service.player2 = player2;
        });

        it('should return player 1 if is local', () => {
            service['localPlayerId'] = player1.id;
            const result = service.getLocalPlayer();
            expect(result).toEqual(player1);
        });

        it('should return player 2 if is local', () => {
            service['localPlayerId'] = player2.id;
            const result = service.getLocalPlayer();
            expect(result).toEqual(player2);
        });

        it('should return undefined if no player', () => {
            (service['localPlayerId'] as unknown) = undefined;
            const result = service.getLocalPlayer();
            expect(result).not.toBeDefined();
        });

        it('should return player 1 id if is local', () => {
            service['localPlayerId'] = player1.id;
            const result = service.getLocalPlayerId();
            expect(result).toEqual(player1.id);
        });

        it('should return player 2 id if is local', () => {
            service['localPlayerId'] = player2.id;
            const result = service.getLocalPlayerId();
            expect(result).toEqual(player2.id);
        });

        it('should return undefined if no player', () => {
            (service['localPlayerId'] as unknown) = undefined;
            const result = service.getLocalPlayerId();
            expect(result).not.toBeDefined();
        });
    });
});
