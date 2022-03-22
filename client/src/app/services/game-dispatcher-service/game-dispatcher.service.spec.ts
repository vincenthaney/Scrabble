/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LobbyData, LobbyInfo } from '@app/classes/communication';
import { GameConfigData } from '@app/classes/communication/game-config';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { GameDispatcherService, SocketService } from '@app/services/';

const BASE_GAME_ID = 'baseGameId';
const TEST_PLAYER_ID = 'playerId';
const TEST_PLAYER_NAME = 'playerName';

const TEST_LOBBY_DATA: LobbyData = {
    lobbyId: BASE_GAME_ID,
    hostName: '',
    gameType: GameType.Classic,
    maxRoundTime: 0,
    dictionary: '',
};
const TEST_LOBBY_INFO: LobbyInfo = {
    ...TEST_LOBBY_DATA,
    canJoin: true,
};
const TEST_LOBBIES = [TEST_LOBBY_INFO];
const TEST_GAME_PARAMETERS = {
    gameType: GameType.LOG2990,
    gameMode: GameMode.Solo,
    virtualPlayerName: 'Victoria',
    level: VirtualPlayerLevel.Beginner,
    timer: '60',
    dictionary: 'français',
};
const TEST_FORM_CONTENT = {
    gameType: new FormControl(GameType.Classic, Validators.required),
    gameMode: new FormControl(GameMode.Solo, Validators.required),
    virtualPlayerName: new FormControl('', Validators.required),
    level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
    timer: new FormControl('', Validators.required),
    dictionary: new FormControl('', Validators.required),
};
const TEST_FORM: FormGroup = new FormGroup(TEST_FORM_CONTENT);
TEST_FORM.setValue(TEST_GAME_PARAMETERS);

describe('GameDispatcherService', () => {
    let getCurrentLobbyIdSpy: jasmine.Spy;
    let service: GameDispatcherService;
    let gameDispatcherControllerMock: GameDispatcherController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule],
            providers: [GameDispatcherController, SocketService],
        });
        service = TestBed.inject(GameDispatcherService);

        getCurrentLobbyIdSpy = spyOn(service, 'getCurrentLobbyId').and.returnValue(BASE_GAME_ID);
        gameDispatcherControllerMock = TestBed.inject(GameDispatcherController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Subscriptions', () => {
        it('should call handleJoinRequest on joinRequestEvent', () => {
            const spy = spyOn(service, 'handleJoinRequest');
            service['gameDispatcherController']['joinRequestEvent'].next(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call handleLobbyFull on lobbyFullEvent', () => {
            const spy = spyOn(service, 'handleLobbyFull');
            service['gameDispatcherController']['lobbyFullEvent'].next();
            expect(spy).toHaveBeenCalled();
        });

        it('should call navigateByUrl on lobbyRequestValidEvent', () => {
            const spy = spyOn(service.router, 'navigateByUrl');
            service['gameDispatcherController']['lobbyRequestValidEvent'].next();
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleCanceledGame on canceledGameEvent', () => {
            const spy = spyOn(service, 'handleCanceledGame');
            service['gameDispatcherController']['canceledGameEvent'].next(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call handleJoinerRejected on joinerRejectedEvent', () => {
            const spy = spyOn(service, 'handleJoinerRejected');
            service['gameDispatcherController']['joinerRejectedEvent'].next(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call handleJoinerRejected on lobbiesUpdateEvent', () => {
            const lobbies: LobbyInfo[] = [];
            const spy = spyOn(service, 'handleLobbiesUpdate');
            service['gameDispatcherController']['lobbiesUpdateEvent'].next(lobbies);
            expect(spy).toHaveBeenCalledWith(lobbies);
        });

        it('should change lobbyData', () => {
            service['gameDispatcherController']['createGameEvent'].next(TEST_LOBBY_DATA);
            expect(service.currentLobby).toEqual(TEST_LOBBY_DATA);
        });
    });

    describe('getCurrentLobbyId', () => {
        beforeEach(() => {
            getCurrentLobbyIdSpy.and.callThrough();
        });

        it('should return current lobby id if current lobby is defined', () => {
            service.currentLobby = TEST_LOBBY_INFO;
            expect(service.getCurrentLobbyId()).toEqual(TEST_LOBBY_INFO.lobbyId);
        });

        it('should return empty string if current lobby is undefined', () => {
            service.currentLobby = undefined;
            expect(service.getCurrentLobbyId()).toEqual('');
        });
    });

    describe('ngOnDestroy', () => {
        it('should call next', () => {
            const spy = spyOn<any>(service['serviceDestroyed$'], 'next');
            spyOn<any>(service['serviceDestroyed$'], 'complete');
            service.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should call complete', () => {
            spyOn(service['serviceDestroyed$'], 'next');
            const spy = spyOn(service['serviceDestroyed$'], 'complete');
            service.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('resetData should set right attributes', () => {
        service.currentLobby = TEST_LOBBY_INFO;
        service.currentName = 'default name';
        getCurrentLobbyIdSpy.and.callThrough();

        service.resetServiceData();
        expect(service.currentLobby).toBeUndefined();
        expect(service.currentName).toEqual('');
        expect(service.getCurrentLobbyId()).toEqual('');
    });

    describe('handleJoinLobby', () => {
        let spyHandleLobbyJoinRequest: jasmine.Spy;

        beforeEach(() => {
            spyHandleLobbyJoinRequest = spyOn(gameDispatcherControllerMock, 'handleLobbyJoinRequest').and.callFake(() => {
                return;
            });
        });
        it('handleJoinLobby should call gameDispatcherController.handleLobbyJoinRequest with the correct parameters', () => {
            service.handleJoinLobby(TEST_LOBBIES[0], TEST_PLAYER_NAME);
            expect(spyHandleLobbyJoinRequest).toHaveBeenCalledWith(TEST_LOBBIES[0].lobbyId, TEST_PLAYER_NAME);
        });

        it('handleJoinLobby should set right attributes', () => {
            service.currentLobby = undefined;
            service.currentName = '';
            getCurrentLobbyIdSpy.and.callThrough();

            service.handleJoinLobby(TEST_LOBBY_INFO, TEST_PLAYER_NAME);
            expect(service.currentLobby).toBeTruthy();
            expect(service.currentName).toEqual(TEST_PLAYER_NAME);
            expect(service.getCurrentLobbyId()).toEqual(TEST_LOBBY_INFO.lobbyId);
        });
    });

    it('handleLobbyListRequest should call gameDispatcherController.handleLobbiesListRequest', () => {
        const spyHandleLobbyJoinRequest = spyOn(gameDispatcherControllerMock, 'handleLobbiesListRequest').and.callFake(() => {
            return;
        });
        service.handleLobbyListRequest();
        expect(spyHandleLobbyJoinRequest).toHaveBeenCalled();
    });

    it('handleCreateGame should call gameDispatcherController.handleGameCreation with the correct parameters for solo game', () => {
        const spyHandleGameCreation = spyOn(gameDispatcherControllerMock, 'handleGameCreation').and.callFake(() => {
            return;
        });
        spyOn(gameDispatcherControllerMock.socketService, 'getId').and.callFake(() => {
            return TEST_PLAYER_ID;
        });
        const EXPECTED_GAME_CONFIG: GameConfigData = {
            playerName: TEST_PLAYER_NAME,
            playerId: TEST_PLAYER_ID,
            gameType: TEST_GAME_PARAMETERS.gameType,
            gameMode: TEST_GAME_PARAMETERS.gameMode,
            virtualPlayerName: TEST_GAME_PARAMETERS.virtualPlayerName,
            virtualPlayerLevel: TEST_GAME_PARAMETERS.level,
            maxRoundTime: TEST_GAME_PARAMETERS.timer as unknown as number,
            dictionary: TEST_GAME_PARAMETERS.dictionary,
        };

        service.handleCreateGame(TEST_PLAYER_NAME, TEST_FORM);
        expect(spyHandleGameCreation).toHaveBeenCalledWith(EXPECTED_GAME_CONFIG);
    });

    it('handleCreateGame should call gameDispatcherController.handleGameCreation with the correct parameters for multiplayer game', () => {
        const spyHandleGameCreation = spyOn(gameDispatcherControllerMock, 'handleGameCreation').and.callFake(() => {
            return;
        });
        spyOn(gameDispatcherControllerMock.socketService, 'getId').and.callFake(() => {
            return TEST_PLAYER_ID;
        });
        const EXPECTED_GAME_CONFIG: GameConfigData = {
            playerName: TEST_PLAYER_NAME,
            playerId: TEST_PLAYER_ID,
            gameType: TEST_GAME_PARAMETERS.gameType,
            gameMode: GameMode.Multiplayer,
            maxRoundTime: TEST_GAME_PARAMETERS.timer as unknown as number,
            dictionary: TEST_GAME_PARAMETERS.dictionary,
        };

        TEST_FORM.controls.gameMode.patchValue(GameMode.Multiplayer);
        service.handleCreateGame(TEST_PLAYER_NAME, TEST_FORM);
        expect(spyHandleGameCreation).toHaveBeenCalledWith(EXPECTED_GAME_CONFIG);
        TEST_FORM.setValue(TEST_GAME_PARAMETERS);
    });

    describe('handleCancelGame', () => {
        let cancelGameSpy: jasmine.Spy;
        let resetDataSpy: jasmine.Spy;

        beforeEach(() => {
            resetDataSpy = spyOn<any>(service, 'resetServiceData');
            cancelGameSpy = spyOn(service['gameDispatcherController'], 'handleCancelGame');
        });

        afterEach(() => {
            cancelGameSpy.calls.reset();
            resetDataSpy.calls.reset();
        });

        it('should call handleCancelGame if gameId is defined', () => {
            getCurrentLobbyIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleCancelGame();
            expect(cancelGameSpy).toHaveBeenCalledWith(BASE_GAME_ID);
        });

        it('should not call handleCancelGame if gameId is undefined', () => {
            getCurrentLobbyIdSpy.and.returnValue('');
            service.handleCancelGame();
            expect(cancelGameSpy).not.toHaveBeenCalled();
        });

        it('should call resetData', () => {
            service.handleCancelGame();
            expect(resetDataSpy).toHaveBeenCalled();
        });
    });

    describe('handleConfirmation', () => {
        let confirmationSpy: jasmine.Spy;

        beforeEach(() => {
            confirmationSpy = spyOn(service['gameDispatcherController'], 'handleConfirmationGameCreation');
        });

        afterEach(() => {
            confirmationSpy.calls.reset();
        });

        it('should call handleCancelGame if gameId is defined', () => {
            getCurrentLobbyIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleConfirmation(TEST_PLAYER_NAME);
            expect(confirmationSpy).toHaveBeenCalledWith(TEST_PLAYER_NAME, BASE_GAME_ID);
        });

        it('should not call handleCancelGame if gameId is undefined', () => {
            getCurrentLobbyIdSpy.and.returnValue('');
            service.handleConfirmation(TEST_PLAYER_NAME);
            expect(confirmationSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleRejection', () => {
        let rejectionSpy: jasmine.Spy;

        beforeEach(() => {
            rejectionSpy = spyOn(service['gameDispatcherController'], 'handleRejectionGameCreation');
        });

        afterEach(() => {
            rejectionSpy.calls.reset();
        });

        it('should call handleCancelGame if gameId is defined', () => {
            getCurrentLobbyIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleRejection(TEST_PLAYER_NAME);
            expect(rejectionSpy).toHaveBeenCalledWith(TEST_PLAYER_NAME, BASE_GAME_ID);
        });

        it('should not call handleCancelGame if currentLobbyId is undefined', () => {
            getCurrentLobbyIdSpy.and.returnValue('');
            service.handleRejection(TEST_PLAYER_NAME);
            expect(rejectionSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleJoinRequest', () => {
        it('should emit to joinRequestEvent', () => {
            const spy = spyOn(service['joinRequestEvent'], 'next');
            service.handleJoinRequest(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });
    });

    describe('handleJoinerRejected', () => {
        let emitSpy: jasmine.Spy;
        let resetSpy: jasmine.Spy;

        beforeEach(() => {
            resetSpy = spyOn<any>(service, 'resetServiceData');
            emitSpy = spyOn(service['joinerRejectedEvent'], 'next');
        });

        afterEach(() => {
            emitSpy.calls.reset();
            resetSpy.calls.reset();
        });

        it('should emit to joinerRejectedEvent', () => {
            service.handleJoinerRejected(TEST_PLAYER_NAME);
            expect(emitSpy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call resetData', () => {
            service.handleJoinerRejected(TEST_PLAYER_NAME);
            expect(resetSpy).toHaveBeenCalledWith();
        });
    });

    describe('handleLobbiesUpdate', () => {
        it('should emit to joinRequestEvent', () => {
            const args: LobbyInfo[] = [];
            const spy = spyOn(service['lobbiesUpdateEvent'], 'next');
            service.handleLobbiesUpdate(args);
            expect(spy).toHaveBeenCalledWith(args);
        });
    });

    describe('handleLobbyFull', () => {
        let emitSpy: jasmine.Spy;
        let resetSpy: jasmine.Spy;

        beforeEach(() => {
            resetSpy = spyOn<any>(service, 'resetServiceData');
            emitSpy = spyOn(service['lobbyFullEvent'], 'next');
        });

        afterEach(() => {
            emitSpy.calls.reset();
            resetSpy.calls.reset();
        });

        it('should emit to lobbyFullEvent', () => {
            service.handleLobbyFull();
            expect(emitSpy).toHaveBeenCalledWith();
        });

        it('should call resetData', () => {
            service.handleLobbyFull();
            expect(resetSpy).toHaveBeenCalledWith();
        });
    });

    describe('handleCanceledGame', () => {
        let emitSpy: jasmine.Spy;
        let resetSpy: jasmine.Spy;

        beforeEach(() => {
            resetSpy = spyOn<any>(service, 'resetServiceData');
            emitSpy = spyOn(service['canceledGameEvent'], 'next');
        });

        afterEach(() => {
            emitSpy.calls.reset();
            resetSpy.calls.reset();
        });

        it('should emit to canceledGameEvent', () => {
            service.handleCanceledGame(TEST_PLAYER_NAME);
            expect(emitSpy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call resetData', () => {
            service.handleCanceledGame(TEST_PLAYER_NAME);
            expect(resetSpy).toHaveBeenCalledWith();
        });
    });
});
