import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { TestBed } from '@angular/core/testing';
import { GameService } from '@app/services';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper';
import { PlayerName } from '@app/classes/communication/player-name';
import { Socket } from 'socket.io-client';
import { GameConfigData } from '@app/classes/communication/game-config';
import { RouterTestingModule } from '@angular/router/testing';
import { GameType } from '@app/classes/game-type';
import { of } from 'rxjs';

const DEFAULT_PLAYER_NAME = 'grogars';
const DEFAULT_OPPONENT_NAME: PlayerName[] = [{ name: DEFAULT_PLAYER_NAME }];
const DEFAULT_GAME_DATA: GameConfigData = {
    playerName: DEFAULT_PLAYER_NAME,
    playerId: 'tessId',
    gameType: GameType.Classic,
    maxRoundTime: 0,
    dictionary: '',
};

describe('GameDispatcherController', () => {
    let controller: GameDispatcherController;
    let httpMock: HttpTestingController;
    let socketServiceMock: SocketService;
    let gameServiceMock: GameService;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketService();
        // eslint-disable-next-line dot-notation
        socketServiceMock['socket'] = socketHelper as unknown as Socket;
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [GameDispatcherController, { provide: SocketService, useValue: socketServiceMock }, GameService],
        });
        controller = TestBed.inject(GameDispatcherController);
        httpMock = TestBed.inject(HttpTestingController);
        gameServiceMock = TestBed.inject(GameService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(controller).toBeTruthy();
    });
    // ////////////////////////////////////////////////////////////////
    it('On join request, configureSocket should emit opponent name', () => {
        const joinRequestSpy = spyOn(controller.joinRequestEvent, 'emit').and.callThrough();
        socketHelper.peerSideEmit('joinRequest', DEFAULT_OPPONENT_NAME);
        expect(joinRequestSpy).toHaveBeenCalled();
    });

    it('On start game, configureSocket should emit socket id and game data', async () => {
        const startGameRequestSpy = spyOn(gameServiceMock, 'initializeMultiplayerGame').and.callFake(async () => {
            return;
        });
        socketHelper.peerSideEmit('startGame', DEFAULT_GAME_DATA);
        expect(startGameRequestSpy).toHaveBeenCalled();
    });

    it('On lobbies update, configureSocket should emit hostName', () => {
        const lobbiesUpdateSpy = spyOn(controller.lobbiesUpdateEvent, 'emit').and.callThrough();
        socketHelper.peerSideEmit('lobbiesUpdate', DEFAULT_OPPONENT_NAME);
        expect(lobbiesUpdateSpy).toHaveBeenCalled();
    });

    it('On rejected, configureSocket should emit lobbies', () => {
        const rejectedSpy = spyOn(controller.joinerRejectedEvent, 'emit').and.callThrough();
        socketHelper.peerSideEmit('rejected', DEFAULT_OPPONENT_NAME);
        expect(rejectedSpy).toHaveBeenCalled();
    });

    it('On full lobby, configureSocket should emit opponent name', () => {
        const lobbyFullSpy = spyOn(controller.lobbyFullEvent, 'emit').and.callThrough();
        socketHelper.peerSideEmit('lobbyFull', DEFAULT_OPPONENT_NAME);
        expect(lobbyFullSpy).toHaveBeenCalled();
    });

    it('On cancel game, configureSocket should emit opponent name', () => {
        const cancelGameSpy = spyOn(controller.canceledGameEvent, 'emit').and.callThrough();
        socketHelper.peerSideEmit('canceledGame', DEFAULT_OPPONENT_NAME);
        expect(cancelGameSpy).toHaveBeenCalled();
    });

    it('On joiner leave game, configureSocket should emit opponent name', () => {
        const joinerLeaveSpy = spyOn(controller.joinerLeaveGameEvent, 'emit').and.callThrough();
        socketHelper.peerSideEmit('joinerLeaveGame', DEFAULT_OPPONENT_NAME);
        expect(joinerLeaveSpy).toHaveBeenCalled();
    });
    // // ////////////////////////////////////////////////
    it('handleMultiplayerGameCreation POST', () => {
        // eslint-disable-next-line dot-notation, @typescript-eslint/no-explicit-any
        const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
        controller.handleMultiplayerGameCreation(DEFAULT_GAME_DATA);
        expect(httpPostSpy).toHaveBeenCalled();
    });

    it('handleMultiplayerGameCreation EMIT', () => {
        const createGameSpy = spyOn(controller.createGameEvent, 'emit').and.callThrough();
        controller.handleMultiplayerGameCreation(DEFAULT_GAME_DATA);
        expect(createGameSpy).toHaveBeenCalled();
    });

    it('handleConfirmationGameCreation', () => {
        expect(controller).toBeTruthy();
    });

    it('handleRejectionGameCreation', () => {
        expect(controller).toBeTruthy();
    });

    it('handleCancelGame', () => {
        expect(controller).toBeTruthy();
    });

    it('handleLeaveLobby', () => {
        expect(controller).toBeTruthy();
    });

    it('handleLobbiesListRequest', () => {
        expect(controller).toBeTruthy();
    });

    it('handleLobbyJoinRequest', () => {
        expect(controller).toBeTruthy();
    });
});
