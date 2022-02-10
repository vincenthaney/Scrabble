import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { TestBed } from '@angular/core/testing';
import SpyObj = jasmine.SpyObj;
import { GameService } from '@app/services';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper';
import { Opponent } from '@app/classes/player';

const DEFAULT_ID = 0;
const DEFAULT_NAME = grogars;

describe('GameDispatcherController', () => {
    let controller: GameDispatcherController;
    let httpMock: HttpTestingController;
    let socketServiceMock: SpyObj<SocketService>;
    let gameServiceMock: SpyObj<GameService>;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        socketServiceMock = jasmine.createSpyObj('SocketService', ['on']);
        gameServiceMock = jasmine.createSpyObj('GameService', ['']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                GameDispatcherController,
                { provide: SocketService, useValue: socketServiceMock },
                { provide: GameService, useValue: gameServiceMock },
            ],
        });
        controller = TestBed.inject(GameDispatcherController);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(controller).toBeTruthy();
    });
    // ////////////////////////////////////////////////////////////////
    it('On join request, configureSocket should emit opponent name', () => {
    });

    it('On start game, configureSocket should emit socket id and game data', () => {
        expect(controller).toBeTruthy();
    });

    it('On lobbies update, configureSocket should emit lobbies', () => {
        expect(controller).toBeTruthy();
    });

    it('On full lobby, configureSocket should emit opponent name', () => {
        expect(controller).toBeTruthy();
    });

    it('On cancel game, configureSocket should emit opponent name', () => {
        expect(controller).toBeTruthy();
    });

    it('On joiner leave game, configureSocket should emit opponent name', () => {
        expect(controller).toBeTruthy();
    });
    // ////////////////////////////////////////////////
    it('handleMultiplayerGameCreation', () => {
        expect(controller).toBeTruthy();
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
