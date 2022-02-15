/* eslint-disable max-lines */
/* eslint-disable dot-notation */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LobbyInfo } from '@app/classes/communication';
import { GameConfigData } from '@app/classes/communication/game-config';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { GameDispatcherService, SocketService } from '@app/services/';

const BASE_GAME_ID = 'baseGameId';
const TEST_PLAYER_ID = 'playerId';
const TEST_PLAYER_NAME = 'playerName';
const TEST_LOBBY_INFO = {
    lobbyId: '',
    playerName: '',
    gameType: GameType.Classic,
    maxRoundTime: 0,
    dictionary: '',
    canJoin: true,
};
const TEST_LOBBIES = [TEST_LOBBY_INFO];
const TEST_GAME_PARAMETERS = {
    gameType: GameType.LOG2990,
    gameMode: GameMode.Solo,
    level: VirtualPlayerLevel.Beginner,
    timer: '60',
    dictionary: 'français',
};
const TEST_FORM_CONTENT = {
    gameType: new FormControl(GameType.Classic, Validators.required),
    gameMode: new FormControl(GameMode.Solo, Validators.required),
    level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
    timer: new FormControl('', Validators.required),
    dictionary: new FormControl('', Validators.required),
};
const TEST_FORM: FormGroup = new FormGroup(TEST_FORM_CONTENT);
TEST_FORM.setValue(TEST_GAME_PARAMETERS);

describe('GameDispatcherService', () => {
    let service: GameDispatcherService;
    let gameDispatcherControllerMock: GameDispatcherController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule],
            providers: [GameDispatcherController, SocketService],
        });
        service = TestBed.inject(GameDispatcherService);

        service.gameId = BASE_GAME_ID;
        gameDispatcherControllerMock = TestBed.inject(GameDispatcherController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Subscriptions', () => {
        it('should set gameId on createGameEvent', () => {
            service.gameId = undefined;
            service['gameDispatcherController'].createGameEvent.emit(BASE_GAME_ID);
            expect(service.gameId as string | undefined).toEqual(BASE_GAME_ID);
        });

        it('should call handleJoinRequest on joinRequestEvent', () => {
            const spy = spyOn(service, 'handleJoinRequest');
            service['gameDispatcherController'].joinRequestEvent.emit(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call handleLobbyFull on lobbyFullEvent', () => {
            const spy = spyOn(service, 'handleLobbyFull');
            service['gameDispatcherController'].lobbyFullEvent.emit();
            expect(spy).toHaveBeenCalled();
        });

        it('should call navigateByUrl on lobbyRequestValidEvent', () => {
            const spy = spyOn(service.router, 'navigateByUrl');
            service['gameDispatcherController'].lobbyRequestValidEvent.emit();
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleCanceledGame on canceledGameEvent', () => {
            const spy = spyOn(service, 'handleCanceledGame');
            service['gameDispatcherController'].canceledGameEvent.emit(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call handleJoinerLeaveGame on joinerLeaveGameEvent', () => {
            const spy = spyOn(service, 'handleJoinerLeaveGame');
            service['gameDispatcherController'].joinerLeaveGameEvent.emit(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call handleJoinerRejected on joinerRejectedEvent', () => {
            const spy = spyOn(service, 'handleJoinerRejected');
            service['gameDispatcherController'].joinerRejectedEvent.emit(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call handleJoinerRejected on lobbiesUpdateEvent', () => {
            const lobbies: LobbyInfo[] = [];
            const spy = spyOn(service, 'handleLobbiesUpdate');
            service['gameDispatcherController'].lobbiesUpdateEvent.emit(lobbies);
            expect(spy).toHaveBeenCalledWith(lobbies);
        });
    });

    describe('ngOnDestroy', () => {
        it('should call next', () => {
            const spy = spyOn(service.serviceDestroyed$, 'next');
            spyOn(service.serviceDestroyed$, 'complete');
            service.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should call complete', () => {
            spyOn(service.serviceDestroyed$, 'next');
            const spy = spyOn(service.serviceDestroyed$, 'complete');
            service.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('resetData should set right attributes', () => {
        service.currentLobby = TEST_LOBBY_INFO;
        service.currentName = 'default name';
        service.gameId = 'default game id';

        service.resetData();
        expect(service.currentLobby).toBeUndefined();
        expect(service.currentName).toEqual('');
        expect(service.gameId).toBeUndefined();
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
            service.gameId = '';

            service.handleJoinLobby(TEST_LOBBY_INFO, TEST_PLAYER_NAME);
            expect(service.currentLobby).toBeTruthy();
            expect(service.currentName).toEqual(TEST_PLAYER_NAME);
            expect(service.gameId).toEqual(TEST_LOBBY_INFO.lobbyId);
        });
    });

    it('handleLobbyListRequest should call gameDispatcherController.handleLobbiesListRequest', () => {
        const spyHandleLobbyJoinRequest = spyOn(gameDispatcherControllerMock, 'handleLobbiesListRequest').and.callFake(() => {
            return;
        });
        service.handleLobbyListRequest();
        expect(spyHandleLobbyJoinRequest).toHaveBeenCalled();
    });

    describe('handleLeaveLobby', () => {
        let spyHandleLobbyJoinRequest: jasmine.Spy;

        beforeEach(() => {
            spyHandleLobbyJoinRequest = spyOn(gameDispatcherControllerMock, 'handleLeaveLobby').and.callFake(() => {
                return;
            });
        });

        it('handleLeaveLobby should always call resetData', () => {
            const spy = spyOn(service, 'resetData').and.callFake(() => {
                return;
            });
            service.handleLeaveLobby();
            expect(spy).toHaveBeenCalled();
        });

        it('handleLeaveLobby should call gameDispatcherController.handleLobbiesListRequest if gameId is defined', () => {
            service.gameId = 'game Id';
            service.handleLeaveLobby();
            expect(spyHandleLobbyJoinRequest).toHaveBeenCalled();
        });

        it('handleLeaveLobby should NOT call gameDispatcherController.handleLobbiesListRequest if gameId is undefined', () => {
            service.gameId = undefined;
            service.handleLeaveLobby();
            expect(spyHandleLobbyJoinRequest).not.toHaveBeenCalled();
        });
    });

    it('handleCreateGame should call gameDispatcherController.handleMultiplayerGameCreation \
    with the correct parameters', () => {
        const spyHandleMultiplayerGameCreation = spyOn(gameDispatcherControllerMock, 'handleMultiplayerGameCreation').and.callFake(() => {
            return;
        });
        spyOn(gameDispatcherControllerMock.socketService, 'getId').and.callFake(() => {
            return TEST_PLAYER_ID;
        });
        const EXPECTED_GAME_CONFIG: GameConfigData = {
            playerName: TEST_PLAYER_NAME,
            playerId: TEST_PLAYER_ID,
            gameType: TEST_GAME_PARAMETERS.gameType,
            maxRoundTime: TEST_GAME_PARAMETERS.timer as unknown as number,
            dictionary: TEST_GAME_PARAMETERS.dictionary,
        };

        service.handleCreateGame(TEST_PLAYER_NAME, TEST_FORM);
        expect(spyHandleMultiplayerGameCreation).toHaveBeenCalledWith(EXPECTED_GAME_CONFIG);
    });

    describe('handleCancelGame', () => {
        let cancelGameSpy: jasmine.Spy;
        let resetDataSpy: jasmine.Spy;

        beforeEach(() => {
            cancelGameSpy = spyOn(service['gameDispatcherController'], 'handleCancelGame');
            resetDataSpy = spyOn(service, 'resetData');
        });

        afterEach(() => {
            cancelGameSpy.calls.reset();
            resetDataSpy.calls.reset();
        });

        it('should call handleCancelGame if gameId is defined', () => {
            service.gameId = BASE_GAME_ID;
            service.handleCancelGame();
            expect(cancelGameSpy).toHaveBeenCalledWith(BASE_GAME_ID);
        });

        it('should not call handleCancelGame if gameId is undefined', () => {
            service.gameId = undefined;
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
            service.gameId = BASE_GAME_ID;
            service.handleConfirmation(TEST_PLAYER_NAME);
            expect(confirmationSpy).toHaveBeenCalledWith(TEST_PLAYER_NAME, BASE_GAME_ID);
        });

        it('should not call handleCancelGame if gameId is undefined', () => {
            service.gameId = undefined;
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
            service.gameId = BASE_GAME_ID;
            service.handleRejection(TEST_PLAYER_NAME);
            expect(rejectionSpy).toHaveBeenCalledWith(TEST_PLAYER_NAME, BASE_GAME_ID);
        });

        it('should not call handleCancelGame if gameId is undefined', () => {
            service.gameId = undefined;
            service.handleRejection(TEST_PLAYER_NAME);
            expect(rejectionSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleJoinRequest', () => {
        it('should emit to joinRequestEvent', () => {
            const spy = spyOn(service.joinRequestEvent, 'emit');
            service.handleJoinRequest(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });
    });

    describe('handleJoinerRejected', () => {
        let emitSpy: jasmine.Spy;
        let resetSpy: jasmine.Spy;

        beforeEach(() => {
            emitSpy = spyOn(service.joinerRejectedEvent, 'emit');
            resetSpy = spyOn(service, 'resetData');
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
            const spy = spyOn(service.lobbiesUpdateEvent, 'emit');
            service.handleLobbiesUpdate(args);
            expect(spy).toHaveBeenCalledWith(args);
        });
    });

    describe('handleLobbyFull', () => {
        let emitSpy: jasmine.Spy;
        let resetSpy: jasmine.Spy;

        beforeEach(() => {
            emitSpy = spyOn(service.lobbyFullEvent, 'emit');
            resetSpy = spyOn(service, 'resetData');
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
            emitSpy = spyOn(service.canceledGameEvent, 'emit');
            resetSpy = spyOn(service, 'resetData');
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

    describe('handleJoinerLeaveGame', () => {
        it('should emit to joinRequestEvent', () => {
            const spy = spyOn(service.joinerLeaveGameEvent, 'emit');
            service.handleJoinerLeaveGame(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });
    });
});
