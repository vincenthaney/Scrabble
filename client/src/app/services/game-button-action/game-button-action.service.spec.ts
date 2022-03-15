/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionData, ActionPlacePayload, ActionType } from '@app/classes/actions/action-data';
import { AbstractPlayer, Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { DEFAULT_PLAYER } from '@app/constants/game';
import { NO_LOCAL_PLAYER } from '@app/constants/services-errors';
import { GameButtonActionService } from './game-button-action.service';

const DEFAULT_PLAYER_ID = DEFAULT_PLAYER.id;
const DEFAULT_GAME_ID = 'some id';

describe('GameButtonActionService', () => {
    let service: GameButtonActionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        service = TestBed.inject(GameButtonActionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('createPassAction', () => {
        let getLocalPlayerIdSpy: jasmine.Spy;

        beforeEach(() => {
            getLocalPlayerIdSpy = spyOn(service['gameService'], 'getLocalPlayerId').and.returnValue(DEFAULT_PLAYER_ID);
        });

        it('should call gameservice.getLocalPlayerId', () => {
            service.createPassAction();
            expect(getLocalPlayerIdSpy).toHaveBeenCalled();
        });

        it('should throw NO_LOCAL_PLAYER if localPlayerId is undefined', () => {
            getLocalPlayerIdSpy.and.returnValue(undefined);
            expect(() => service.createPassAction()).toThrow(new Error(NO_LOCAL_PLAYER));
        });

        it('should call sendAction with valid action data', () => {
            const sendActionSpy = spyOn(service['gamePlayController'], 'sendAction').and.callFake(() => {
                return;
            });
            service['gameService']['gameId'] = DEFAULT_GAME_ID;
            const expectedActionData: ActionData = {
                type: ActionType.PASS,
                input: '',
                payload: {},
            };
            service.createPassAction();
            expect(sendActionSpy).toHaveBeenCalledWith(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, expectedActionData);
        });
    });

    describe('getPlayerIfTurn', () => {
        let player: AbstractPlayer;

        beforeEach(() => {
            player = new Player('nicole-123', 'Nicole', []);
        });

        it('should return player if is local player turn', () => {
            spyOn(service['gameService'], 'getLocalPlayer').and.returnValue(player);
            spyOn(service['gameService'], 'isLocalPlayerPlaying').and.returnValue(true);

            const result = service.getPlayerIfTurn();

            expect(result).toEqual(player);
        });

        it('should return undefined if is not local player turn', () => {
            spyOn(service['gameService'], 'getLocalPlayer').and.returnValue(player);
            spyOn(service['gameService'], 'isLocalPlayerPlaying').and.returnValue(false);

            const result = service.getPlayerIfTurn();

            expect(result).toEqual(undefined);
        });

        it('should throw if getLocalPlayer returns undefined', () => {
            spyOn(service['gameService'], 'getLocalPlayer').and.returnValue(undefined);

            expect(() => service.getPlayerIfTurn()).toThrowError(NO_LOCAL_PLAYER);
        });
    });

    describe('sendExchangeAction', () => {
        let player: AbstractPlayer;
        let getPlayerIfTurnSpy: jasmine.Spy;
        let checkIfPlayerHasTilesSpy: jasmine.Spy;
        let sendErrorSpy: jasmine.Spy;

        beforeEach(() => {
            player = new Player('karine-62', 'Karine', []);
            getPlayerIfTurnSpy = spyOn(service, 'getPlayerIfTurn').and.returnValue(player);
            checkIfPlayerHasTilesSpy = spyOn<any>(service, 'checkIfPlayerHasTiles').and.returnValue(true);
            sendErrorSpy = spyOn<any>(service, 'sendError');
            service['gameService']['gameId'] = DEFAULT_GAME_ID;
        });

        it('should call sendAction', () => {
            const spy = spyOn(service['gamePlayController'], 'sendAction');
            const tiles: Tile[] = [];

            service.sendExchangeAction(tiles);

            expect(spy).toHaveBeenCalledOnceWith(DEFAULT_GAME_ID, player.id, {
                type: ActionType.EXCHANGE,
                input: '',
                payload: { tiles },
            });
        });

        it('should not call sendAction if player is undefined', () => {
            getPlayerIfTurnSpy.and.returnValue(undefined);
            const spy = spyOn(service['gamePlayController'], 'sendAction');
            const tiles: Tile[] = [];

            service.sendExchangeAction(tiles);

            expect(spy).not.toHaveBeenCalled();
        });

        it('should not call sendAction if player does not have tiles', () => {
            checkIfPlayerHasTilesSpy.and.returnValue(false);
            const spy = spyOn(service['gamePlayController'], 'sendAction');
            const tiles: Tile[] = [];

            service.sendExchangeAction(tiles);

            expect(spy).not.toHaveBeenCalled();
        });

        it('should send error if player does not have tiles', () => {
            checkIfPlayerHasTilesSpy.and.returnValue(false);
            const tiles: Tile[] = [];

            service.sendExchangeAction(tiles);

            expect(sendErrorSpy).toHaveBeenCalled();
        });
    });

    describe('sendPlaceAction', () => {
        let player: AbstractPlayer;
        let getPlayerIfTurnSpy: jasmine.Spy;
        let sendActionSpy: jasmine.Spy;

        beforeEach(() => {
            player = new Player('celine-58', 'Céline', []);
            getPlayerIfTurnSpy = spyOn(service, 'getPlayerIfTurn').and.returnValue(player);
            sendActionSpy = spyOn(service['gamePlayController'], 'sendAction');
            service['gameService']['gameId'] = DEFAULT_GAME_ID;
        });

        it('should call sendAction', () => {
            const payload: ActionPlacePayload = {} as ActionPlacePayload;

            service.sendPlaceAction(payload);

            expect(sendActionSpy).toHaveBeenCalledOnceWith(DEFAULT_GAME_ID, player.id, {
                type: ActionType.PLACE,
                input: '',
                payload,
            });
        });

        it('should not call sendAction if no player', () => {
            getPlayerIfTurnSpy.and.returnValue(undefined);
            const payload: ActionPlacePayload = {} as ActionPlacePayload;

            service.sendPlaceAction(payload);

            expect(sendActionSpy).not.toHaveBeenCalled();
        });
    });

    describe('checkIfPlayerHasTiles', () => {
        it('should work', () => {
            const tests: [string[], boolean][] = [
                [['A'], true],
                [['*'], true],
                [['A', 'B', '*'], true],
                [['C', '*', 'A', 'B'], true],
                [['X', 'Z'], false],
                [['A', 'Z'], false],
                [['A', 'A'], false],
            ];
            const playerTiles: Tile[] = [{ letter: 'A' }, { letter: 'B' }, { letter: 'C' }, { letter: '*' }] as Tile[];
            const player = new Player('jocelyn-54', 'Jocelyn', playerTiles);

            for (const [letters, expected] of tests) {
                const tiles: Tile[] = letters.map((letter) => ({ letter } as Tile));
                const result = service['checkIfPlayerHasTiles'](tiles, player);
                expect(result).toEqual(expected);
            }
        });
    });
});
