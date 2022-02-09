// import { TestBed } from '@angular/core/testing';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { GameDispatcherController } from './game-dispatcher.controller';
// // import { GameType } from '@app/classes/game-type';
// // import { GameConfigData } from '@app/classes/communication/game-config';
// import { HttpClient } from '@angular/common/http';

// describe('LocationService', () => {
//     // let gameDispatcherController: GameDispatcherController;
//     let httpMock: HttpTestingController;
//     // let httpClient: HttpClient;

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule],
//             providers: [GameDispatcherController],
//         });
//         gameDispatcherController = TestBed.inject(GameDispatcherController);
//         httpMock = TestBed.inject(HttpTestingController);
//         httpClient = TestBed.inject(HttpClient);
//     });

//     afterEach(() => {
//         // After every test, assert that there are no more pending requests.
//         httpMock.verify();
//     });

//     // it('should call getAllBooks and return an array of Books', () => {
//     //     const EXPECTED_GAME_CONFIG: GameConfigData = {
//     //         playerName: '',
//     //         playerId: '',
//     //         gameType: GameType.Classic,
//     //         maxRoundTime: 1,
//     //         dictionary: '',
//     //     };
//     //     gameDispatcherController.handleMultiplayerGameCreation(EXPECTED_GAME_CONFIG).subscribe((res) => {
//     //         //2

//     //         expect(res).toEqual(mockBookArray);
//     //         const TEST_GAME_ID = 'testid';
//     //         spyOn(gameDispatcherController.createGameEvent, 'emit').and.callFake(() => {
//     //             return;
//     //         });
//     //         req.flush(TEST_GAME_ID);
//     //     });

//     //     //3
//     //     const req = httpMock.expectOne({
//     //         method: 'GET',
//     //         url: `${url}/books`,
//     //     });

//     //     //4
//     //     req.flush(mockBookArray);
//     // });
// });
