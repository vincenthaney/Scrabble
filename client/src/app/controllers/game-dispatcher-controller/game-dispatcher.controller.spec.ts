import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { TestBed } from '@angular/core/testing';
import SpyObj = jasmine.SpyObj;
import { GameService } from '@app/services';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SocketService } from '@app/services/socket/socket.service';


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
});
