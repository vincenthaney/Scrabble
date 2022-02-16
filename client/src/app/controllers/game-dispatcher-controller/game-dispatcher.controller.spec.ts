/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameConfigData } from '@app/classes/communication/game-config';
import PlayerName from '@app/classes/communication/player-name';
import { GameType } from '@app/classes/game-type';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { GameService } from '@app/services';
import SocketService from '@app/services/socket/socket.service';
import { Observable, of, throwError } from 'rxjs';
import { Socket } from 'socket.io-client';

const DEFAULT_SOCKET_ID = 'testSocketID';
const DEFAULT_PLAYER_NAME = 'grogars';
const DEFAULT_GAME_ID = 'grogarsID';
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

    describe('ngOnDestroy', () => {
        it('should call next', () => {
            const spy = spyOn(controller.serviceDestroyed$, 'next');
            spyOn(controller.serviceDestroyed$, 'complete');
            controller.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should call complete', () => {
            spyOn(controller.serviceDestroyed$, 'next');
            const spy = spyOn(controller.serviceDestroyed$, 'complete');
            controller.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('configureSocket', () => {
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

        it('On cancel game, configureSocket should emit opponent name', () => {
            const cancelGameSpy = spyOn(controller.canceledGameEvent, 'emit').and.callThrough();
            socketHelper.peerSideEmit('canceledGame', DEFAULT_OPPONENT_NAME);
            expect(cancelGameSpy).toHaveBeenCalled();
        });
    });

    describe('handleMultiplayerGameCreation', () => {
        it('handleMultiplayerGameCreation should  make an HTTP post request', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            controller.handleMultiplayerGameCreation(DEFAULT_GAME_DATA);
            expect(httpPostSpy).toHaveBeenCalled();
        });

        it('handleMultiplayerGameCreation should emit to createGameEvent', () => {
            const fakeObservable = of<string>('fakeResponse');
            spyOn(controller['http'], 'post').and.returnValue(fakeObservable);
            const createGameSpy = spyOn(controller.createGameEvent, 'emit').and.callThrough();
            controller.handleMultiplayerGameCreation(DEFAULT_GAME_DATA);
            expect(createGameSpy).toHaveBeenCalled();
        });
    });

    describe('handleConfirmationGameCreation', () => {
        it('handleConfirmationGameCreation should make an HTTP post request', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            controller.handleConfirmationGameCreation(DEFAULT_PLAYER_NAME, DEFAULT_GAME_ID);
            expect(httpPostSpy).toHaveBeenCalled();
        });

        it('handleConfirmationGameCreation should subscribe after making an HTTP post request', async () => {
            spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_SOCKET_ID);
            const observable = new Observable();
            spyOn(controller['http'], 'post').and.returnValue(observable);
            const spy = spyOn(observable, 'subscribe');

            controller.handleMultiplayerGameCreation({} as unknown as GameConfigData);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleRejectionGameCreation', () => {
        it('handleRejectionGameCreation should make an HTTP post request', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            controller.handleRejectionGameCreation(DEFAULT_PLAYER_NAME, DEFAULT_GAME_ID);
            expect(httpPostSpy).toHaveBeenCalled();
        });

        it('handleRejectionGameCreation should subscribe after making an HTTP post request', () => {
            spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_SOCKET_ID);

            const observable = new Observable();
            spyOn(controller['http'], 'post').and.returnValue(observable);
            const spy = spyOn(observable, 'subscribe');

            controller.handleRejectionGameCreation({} as unknown as string, {} as unknown as string);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleCancelGame', () => {
        it('handleCancelGame should make an HTTP delete request', () => {
            const httpPostSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
            controller.handleCancelGame(DEFAULT_GAME_ID);
            expect(httpPostSpy).toHaveBeenCalled();
        });

        it('handleCancelGame should subscribe after making an HTTP delete request', () => {
            spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_SOCKET_ID);

            const observable = new Observable();
            spyOn(controller['http'], 'delete').and.returnValue(observable);
            const spy = spyOn(observable, 'subscribe');

            controller.handleCancelGame({} as unknown as string);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleLobbiesListRequest', () => {
        it('handleLobbiesListRequest should make an HTTP get request ', () => {
            const httpPostSpy = spyOn(controller['http'], 'get').and.returnValue(of(true) as any);
            controller.handleLobbiesListRequest();
            expect(httpPostSpy).toHaveBeenCalled();
        });

        it('handleLobbiesListRequest should subscribe after making an HTTP get request', () => {
            spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_SOCKET_ID);

            const observable = new Observable();
            spyOn(controller['http'], 'get').and.returnValue(observable);
            const spy = spyOn(observable, 'subscribe');

            controller.handleLobbiesListRequest();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleLobbyJoinRequest', () => {
        it('handleLobbyJoinRequest should make an HTTP post request', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            controller.handleLobbyJoinRequest(DEFAULT_GAME_ID, DEFAULT_PLAYER_NAME);
            expect(httpPostSpy).toHaveBeenCalled();
        });

        it('handleLobbyJoinRequest should subscribe after making an HTTP post request', () => {
            spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_SOCKET_ID);

            const observable = new Observable();
            spyOn(controller['http'], 'post').and.returnValue(observable);
            const spy = spyOn(observable, 'subscribe');

            controller.handleLobbyJoinRequest({} as unknown as string, {} as unknown as string);
            expect(spy).toHaveBeenCalled();
        });

        it('handleLobbyJoinRequest should emit when HTTP post request on success', () => {
            const fakeObservable = of<string>('fakeResponse');
            spyOn(controller['http'], 'post').and.returnValue(fakeObservable);
            const successSpy = spyOn(controller.lobbyRequestValidEvent, 'emit');
            controller.handleLobbyJoinRequest(DEFAULT_GAME_ID, DEFAULT_PLAYER_NAME);
            expect(successSpy).toHaveBeenCalled();
        });

        it('handleLobbyJoinRequest should call handleJoinError when HTTP post request generates an error', () => {
            spyOn(controller['http'], 'post').and.callFake(() => {
                return throwError('fakeError');
            });
            const errorSpy = spyOn(controller, 'handleJoinError').and.callFake(() => {
                return;
            });
            controller.handleLobbyJoinRequest(DEFAULT_GAME_ID, DEFAULT_PLAYER_NAME);
            expect(errorSpy).toHaveBeenCalled();
        });
    });

    describe('handleJoinError', () => {
        it('handleJoinError should emit lobyFullEvent if error status is Unauthorized', () => {
            const lobbyFullEmitSpy = spyOn(controller.lobbyFullEvent, 'emit').and.callFake(() => {
                return;
            });
            const canceledGameEmitSpy = spyOn(controller.canceledGameEvent, 'emit').and.callFake(() => {
                return;
            });
            controller.handleJoinError(
                new HttpErrorResponse({
                    status: HttpStatusCode.Unauthorized,
                }),
            );
            expect(lobbyFullEmitSpy).toHaveBeenCalled();
            expect(canceledGameEmitSpy).not.toHaveBeenCalled();
        });

        it('handleJoinError should emit canceledGameEvent if error status is Gone', () => {
            const lobbyFullEmitSpy = spyOn(controller.lobbyFullEvent, 'emit').and.callFake(() => {
                return;
            });
            const canceledGameEmitSpy = spyOn(controller.canceledGameEvent, 'emit').and.callFake(() => {
                return;
            });
            controller.handleJoinError(
                new HttpErrorResponse({
                    status: HttpStatusCode.Gone,
                }),
            );
            expect(lobbyFullEmitSpy).not.toHaveBeenCalled();
            expect(canceledGameEmitSpy).toHaveBeenCalled();
        });

        it('handleJoinError should emit nothing if error status is not Unauthorized or Gone', () => {
            const lobbyFullEmitSpy = spyOn(controller.lobbyFullEvent, 'emit').and.callFake(() => {
                return;
            });
            const canceledGameEmitSpy = spyOn(controller.canceledGameEvent, 'emit').and.callFake(() => {
                return;
            });
            controller.handleJoinError(
                new HttpErrorResponse({
                    status: HttpStatusCode.BadGateway,
                }),
            );
            expect(lobbyFullEmitSpy).not.toHaveBeenCalled();
            expect(canceledGameEmitSpy).not.toHaveBeenCalled();
        });
    });
});
