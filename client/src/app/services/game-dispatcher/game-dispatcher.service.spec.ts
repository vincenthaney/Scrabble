import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GameConfigData } from '@app/classes/communication/game-config';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { SocketService } from '@app/services/socket/socket.service';
import { GameDispatcherService } from './game-dispatcher.service';

const BASE_GAME_ID = 'baseGameId';
const TEST_GAME_ID = 'gameId';
const TEST_PLAYER_ID = 'playerId';
const TEST_PLAYER_NAME = 'playerName';
const TEST_LOBBIES = [{ lobbyId: '', playerName: '', gameType: GameType.Classic, maxRoundTime: 0, dictionary: '', canJoin: true }];
const TEST_GAME_PARAMETERS = {
    gameType: GameType.LOG2990,
    gameMode: GameMode.Solo,
    level: VirtualPlayerLevel.Beginner,
    timer: '60',
    dictionary: 'français',
};

const TEST_FORM: FormGroup = new FormGroup({
    gameType: new FormControl(GameType.Classic, Validators.required),
    gameMode: new FormControl(GameMode.Solo, Validators.required),
    level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
    timer: new FormControl('', Validators.required),
    dictionary: new FormControl('', Validators.required),
});
TEST_FORM.setValue(TEST_GAME_PARAMETERS);

describe('GameDispatcherService', () => {
    let service: GameDispatcherService;
    let gameDispatcherControllerMock: GameDispatcherController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [GameDispatcherController, SocketService],
        });
        service = TestBed.inject(GameDispatcherService);
    });

    beforeEach(() => {
        service.gameId = BASE_GAME_ID;
        gameDispatcherControllerMock = TestBed.inject(GameDispatcherController);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('handleJoinLobby should call gameDispatcherController.handleLobbyJoinRequest with the correct parameters', () => {
        const spyHandleLobbyJoinRequest = spyOn(gameDispatcherControllerMock, 'handleLobbyJoinRequest').and.callFake(() => {
            return;
        });
        service.handleJoinLobby(TEST_GAME_ID, TEST_PLAYER_NAME);
        expect(spyHandleLobbyJoinRequest).toHaveBeenCalledWith(TEST_GAME_ID, TEST_PLAYER_NAME);
    });

    it('handleLobbyListRequest should call gameDispatcherController.handleLobbiesListRequest with the correct parameters', () => {
        const spyHandleLobbyJoinRequest = spyOn(gameDispatcherControllerMock, 'handleLobbiesListRequest').and.callFake(() => {
            return;
        });
        service.handleLobbyListRequest();
        expect(spyHandleLobbyJoinRequest).toHaveBeenCalled();
    });

    // eslint-disable-next-line max-len
    it('handleLeaveLobby should call gameDispatcherController.handleLobbiesListRequest with the correct parameters and put gameId to undefined', () => {
        const spyHandleLobbyJoinRequest = spyOn(gameDispatcherControllerMock, 'handleLeaveLobby').and.callFake(() => {
            return;
        });
        service.handleLeaveLobby();
        expect(spyHandleLobbyJoinRequest).toHaveBeenCalled();
        expect(service.gameId).toEqual(undefined);
    });

    // eslint-disable-next-line max-len
    it('handleCreateGame should call gameDispatcherController.handleMultiplayerGameCreation with the correct parameters and put gameId to undefined', () => {
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

    it('handleCancelGame should call gameDispatcherController.handleCancelGame with the correct parameters and put gameId to undefined', () => {
        const spyHandleLobbyJoinRequest = spyOn(gameDispatcherControllerMock, 'handleCancelGame').and.callFake(() => {
            return;
        });
        service.handleCancelGame();
        expect(spyHandleLobbyJoinRequest).toHaveBeenCalled();
        expect(service.gameId).toEqual(undefined);
    });

    it('handleConfirmation should call gameDispatcherController.handleConfirmationGameCreation with the correct parameters', () => {
        const spyHandleLobbyJoinRequest = spyOn(gameDispatcherControllerMock, 'handleConfirmationGameCreation').and.callFake(() => {
            return;
        });
        service.handleConfirmation(TEST_PLAYER_NAME);
        expect(spyHandleLobbyJoinRequest).toHaveBeenCalledWith(TEST_PLAYER_NAME, BASE_GAME_ID);
    });

    it('handleRejection should call gameDispatcherController.handleRejectionGameCreation\
     with the correct parameters and put gameId to undefined', () => {
        const spyHandleLobbyJoinRequest = spyOn(gameDispatcherControllerMock, 'handleRejectionGameCreation').and.callFake(() => {
            return;
        });
        service.handleRejection(TEST_PLAYER_NAME);
        expect(spyHandleLobbyJoinRequest).toHaveBeenCalledWith(TEST_PLAYER_NAME, BASE_GAME_ID);
    });

    it('handleJoinRequest should emit the opponentName with joinRequestEvent', () => {
        const spyEmit = spyOn(service.joinRequestEvent, 'emit').and.callFake(() => {
            return;
        });
        service.handleJoinRequest(TEST_PLAYER_NAME);
        expect(spyEmit).toHaveBeenCalledWith(TEST_PLAYER_NAME);
    });

    it('handleLobbiesUpdate should emit the opponentName with lobbiesUpdateEvent', () => {
        const spyEmit = spyOn(service.lobbiesUpdateEvent, 'emit').and.callFake(() => {
            return;
        });
        service.handleLobbiesUpdate(TEST_LOBBIES);
        expect(spyEmit).toHaveBeenCalledWith(TEST_LOBBIES);
    });

    // /////////////////////////////////////////////////////////////
    // TODO:ADDDDD TESTS,  ngOnInit() and subscriber
    // handleJoinRequest(opponentName: string) {
    //     this.joinRequestEvent.emit(opponentName);
    // }

    // handleLobbiesUpdate(lobbies: LobbyInfo[]) {
    //     this.lobbiesUpdateEvent.emit(lobbies);
    // }

    // handleLobbyFull(opponentName: string) {
    //     this.lobbyFullEvent.emit(opponentName);
    //     this.gameId = undefined;
    // }

    // handleCanceledGame(hostName: string) {
    //     this.canceledGameEvent.emit(hostName);
    //     this.gameId = undefined;
    // }

    // handleJoinerLeaveGame(leaverName: string) {
    //     this.joinerLeaveGameEvent.emit(leaverName);
    // }
});
