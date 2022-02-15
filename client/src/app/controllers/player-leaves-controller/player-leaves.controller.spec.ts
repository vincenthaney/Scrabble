import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import { DEFAULT_OPPONENT_NAME } from '@app/constants/controller-constants';
import { GameService, SocketService } from '@app/services';
import { Socket } from 'socket.io-client';
import { PlayerLeavesController } from './player-leaves.controller';

describe('PlayerLeavesController', () => {
    let controller: PlayerLeavesController;
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
            providers: [PlayerLeavesController, { provide: SocketService, useValue: socketServiceMock }, GameService],
        });
        controller = TestBed.inject(PlayerLeavesController);
        httpMock = TestBed.inject(HttpTestingController);
        gameServiceMock = TestBed.inject(GameService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(controller).toBeTruthy();
    });

    it('On joinerLeaveGame, configureSocket should emit opponent name', () => {
        const joinerLeaveGameSpy = spyOn(controller.joinerLeaveGameEvent, 'emit').and.callFake(async () => {
            return;
        });
        socketHelper.peerSideEmit('joinerLeaveGame', DEFAULT_OPPONENT_NAME);
        expect(joinerLeaveGameSpy).toHaveBeenCalled();
    });

    it('On cleanup, configureSocket should emit resetGameEvent', async () => {
        const cleanupSpy = spyOn(controller.resetGameEvent, 'emit').and.callFake(async () => {
            return;
        });
        socketHelper.peerSideEmit('cleanup');
        expect(cleanupSpy).toHaveBeenCalled();
    });

    it('On cleanup, configureSocket should call gamePlayController.newMessageValue.next', async () => {
        // eslint-disable-next-line dot-notation
        const cleanupSpy = spyOn(controller['gamePlayController'].newMessageValue, 'next').and.callFake(async () => {
            return;
        });
        socketHelper.peerSideEmit('cleanup');
        expect(cleanupSpy).toHaveBeenCalled();
    });

    it('handleLeaveLobby should make an HTTP delete request', () => {
        // eslint-disable-next-line dot-notation, @typescript-eslint/no-explicit-any
        const httpPostSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
        controller.handleLeaveGame(DEFAULT_GAME_ID);
        expect(httpPostSpy).toHaveBeenCalled();
    });

    it('handleLeaveLobby should subscribe after making an HTTP delete request', () => {
        // eslint-disable-next-line dot-notation
        spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_SOCKET_ID);

        const observable = new Observable();
        // eslint-disable-next-line dot-notation
        spyOn(controller['http'], 'delete').and.returnValue(observable);
        const spy = spyOn(observable, 'subscribe');

        controller.handleLeaveGame({} as unknown as string);

        expect(spy).toHaveBeenCalled();
    });
});
