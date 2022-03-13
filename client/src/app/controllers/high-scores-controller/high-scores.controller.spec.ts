/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HighScore } from '@app/classes/admin';
import { GameType } from '@app/classes/game-type';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import SocketService from '@app/services/socket/socket.service';
import { of, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { HighScoresController } from './high-scores.controller';

const DEFAULT_HIGH_SCORES: HighScore[] = [
    { names: ['name1'], score: 120, gameType: GameType.Classic },
    { names: ['name2'], score: 220, gameType: GameType.Classic },
    { names: ['name3'], score: 320, gameType: GameType.LOG2990 },
];
const DEFAULT_PLAYER_ID = 'testPlayerID';

describe('HighScoresController', () => {
    let controller: HighScoresController;
    let httpMock: HttpTestingController;
    let socketServiceMock: SocketService;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketService();
        socketServiceMock['socket'] = socketHelper as unknown as Socket;
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [{ provide: SocketService, useValue: socketServiceMock }],
        });
        controller = TestBed.inject(HighScoresController);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(controller).toBeTruthy();
    });

    describe('ngOnDestroy', () => {
        it('should call next', () => {
            const spy = spyOn(controller['serviceDestroyed$'], 'next');
            spyOn(controller['serviceDestroyed$'], 'complete');
            controller.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should call complete', () => {
            spyOn(controller['serviceDestroyed$'], 'next');
            const spy = spyOn(controller['serviceDestroyed$'], 'complete');
            controller.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('Configure Socket', () => {
        it('On join request, configureSocket should emit opponent name', () => {
            const spyHighScoresListEvent = spyOn(controller['highScoresListEvent'], 'next').and.callThrough();
            socketHelper.peerSideEmit('highScoresList', DEFAULT_HIGH_SCORES);
            expect(spyHighScoresListEvent).toHaveBeenCalled();
        });
    });

    describe('HTTP', () => {
        it('handleGetHighScores should get highScores to endpoint', () => {
            spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_PLAYER_ID);

            const httpPostSpy = spyOn(controller['http'], 'get').and.returnValue(of(true) as any);
            const endpoint = `${environment.serverUrl}/highScores/${DEFAULT_PLAYER_ID}`;

            controller.handleGetHighScores();
            expect(httpPostSpy).toHaveBeenCalledWith(endpoint);
        });
    });

    describe('subcription methods', () => {
        let serviceDestroyed$: Subject<boolean>;
        let callback: () => void;

        beforeEach(() => {
            serviceDestroyed$ = new Subject();
            callback = () => {
                return;
            };
        });

        it('subscribeToHighScoresListEvent should call subscribe method on highScoresListEvent', () => {
            const subscriptionSpy = spyOn(controller['highScoresListEvent'], 'subscribe');
            controller.subscribeToHighScoresListEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });
    });
});
