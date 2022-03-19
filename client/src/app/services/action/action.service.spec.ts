/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionData, ActionType, ExchangeActionPayload, PlaceActionPayload } from '@app/classes/actions/action-data';
import { Orientation } from '@app/classes/orientation';
import { Tile } from '@app/classes/tile';
import { DEFAULT_PLAYER } from '@app/constants/game';
import { ActionPayloadToString } from '@app/utils/action-payload-to-string';
import { ActionService } from './action.service';

const DEFAULT_PLAYER_ID = DEFAULT_PLAYER.id;
const DEFAULT_GAME_ID = 'some id';

const DEFAULT_TILES: Tile[] = [new Tile('A', 1), new Tile('A', 2, true)];
const PLACE_PAYLOAD: PlaceActionPayload = {
    tiles: DEFAULT_TILES,
    startPosition: { row: 0, column: 0 },
    orientation: Orientation.Horizontal,
};

const EXCHANGE_PAYLOAD: ExchangeActionPayload = {
    tiles: DEFAULT_TILES,
};

describe('ActionService', () => {
    let service: ActionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        service = TestBed.inject(ActionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('createPlaceActionPayload', () => {
        it('should return ActionPlacePayload with the correct attributes', () => {
            const expectedPayload: PlaceActionPayload = PLACE_PAYLOAD;
            const actualPayload = service.createPlaceActionPayload(PLACE_PAYLOAD.tiles, PLACE_PAYLOAD.startPosition, PLACE_PAYLOAD.orientation);
            expect(actualPayload).toEqual(expectedPayload);
            expect(typeof actualPayload).toBe(typeof expectedPayload);
        });
    });

    describe('createPlaceActionPayload', () => {
        it('should return ActionExchangePayload with the correct attributes', () => {
            const expectedPayload: ExchangeActionPayload = EXCHANGE_PAYLOAD;
            const actualPayload = service.createExchangeActionPayload(DEFAULT_TILES);
            expect(actualPayload).toEqual(expectedPayload);
            expect(typeof actualPayload).toBe(typeof expectedPayload);
        });
    });

    describe('createActionData', () => {
        let inputSpy: jasmine.Spy;
        let actualData: ActionData;

        beforeEach(() => {
            inputSpy = spyOn<any>(service, 'createInputFromPayload').and.returnValue('spyInput');
        });

        it('if input is defined, should not call createInputFromPayload', () => {
            actualData = service.createActionData(ActionType.PASS, {}, 'input');
            expect(inputSpy).not.toHaveBeenCalled();
            expect(actualData.input).toEqual('input');
        });

        it('if input is NOT defined, should call createInputFromPayload', () => {
            actualData = service.createActionData(ActionType.PASS, {});
            expect(inputSpy).toHaveBeenCalledWith(ActionType.PASS, {});
            expect(actualData.input).toEqual('spyInput');
        });

        it('should return ActionData with correct values', () => {
            actualData = service.createActionData(ActionType.EXCHANGE, EXCHANGE_PAYLOAD, 'input');
            const expectedData: ActionData<ExchangeActionPayload> = {
                type: ActionType.EXCHANGE,
                payload: EXCHANGE_PAYLOAD,
                input: 'input',
            };
            expect(actualData).toEqual(expectedData);
        });
    });

    describe('sendAction', () => {
        let sendActionSpy: jasmine.Spy;
        let convertBlankTilesLetterSpy: jasmine.Spy;
        let actionData: ActionData<ExchangeActionPayload>;

        beforeEach(() => {
            sendActionSpy = spyOn(service['gamePlayController'], 'sendAction').and.callFake(() => {
                return;
            });
            convertBlankTilesLetterSpy = spyOn<any>(service, 'convertBlankTilesLetter').and.callFake(() => {
                return;
            });
            actionData = {
                type: ActionType.EXCHANGE,
                payload: EXCHANGE_PAYLOAD,
                input: 'input',
            };
        });

        it('if playerId is undefined, should not sendAction', () => {
            service.sendAction(DEFAULT_GAME_ID, undefined, actionData);
            expect(sendActionSpy).not.toHaveBeenCalled();
        });

        it('should convert blank tiles before PLACE action is sent', () => {
            actionData.type = ActionType.PLACE;
            actionData.payload = PLACE_PAYLOAD;
            service.sendAction(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, actionData);

            expect(convertBlankTilesLetterSpy).toHaveBeenCalledWith(actionData.payload.tiles);
        });

        it('should call gamePlayController.sendAction with provided data', () => {
            service.sendAction(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, actionData);
            expect(sendActionSpy).toHaveBeenCalledWith(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, actionData);
        });
    });

    describe('createInputFromPayload', () => {
        it('should call placeActionPayloadToString on PLACE action', () => {
            const spy = spyOn(ActionPayloadToString, 'placeActionPayloadToString').and.returnValue('');
            service['createInputFromPayload'](ActionType.PLACE, {});
            expect(spy).toHaveBeenCalled();
        });

        it('should call exchangeActionPayloadToString on EXCHANGE action', () => {
            const spy = spyOn(ActionPayloadToString, 'exchangeActionPayloadToString').and.returnValue('');
            service['createInputFromPayload'](ActionType.EXCHANGE, {});
            expect(spy).toHaveBeenCalled();
        });

        it('should call simpleActionToString on other actions', () => {
            const spy = spyOn(ActionPayloadToString, 'simpleActionToString').and.returnValue('');
            service['createInputFromPayload'](ActionType.PASS, {});
            expect(spy).toHaveBeenCalled();
        });
    });

    it('convertBlankTilesLetter should set letter to playedLetter if tile is blank', () => {
        const originalTiles: Tile[] = [
            {
                letter: '*',
                value: 0,
                playedLetter: 'A',
                isBlank: true,
            },
            {
                letter: '*',
                value: 0,
                isBlank: true,
            },
            {
                letter: '*',
                value: 0,
                playedLetter: 'A',
            },
        ];

        const payload = { ...PLACE_PAYLOAD, tiles: originalTiles };
        const expectedTiles: Tile[] = [
            {
                letter: 'A',
                value: 0,
                playedLetter: 'A',
                isBlank: true,
            },
            {
                letter: '*',
                value: 0,
                isBlank: true,
            },
            {
                letter: '*',
                value: 0,
                playedLetter: 'A',
            },
        ];
        const expectedResult = { ...PLACE_PAYLOAD, tiles: expectedTiles };

        service['convertBlankTilesLetter'](payload.tiles);
        expect(payload).toEqual(expectedResult);
    });
});
