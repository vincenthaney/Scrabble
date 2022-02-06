/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { ActionExchangePayload } from '@app/classes/actions/action-exchange';
import { ActionPlacePayload } from '@app/classes/actions/action-place';
import { Orientation } from '@app/classes/orientation';
import { Position } from '@app/classes/position';
import { LetterValue, Tile } from '@app/classes/tile';
import { InputControllerService } from '@app/controllers/input-controller/input-controller.service';
import { InputParserService } from '@app/services';
import GameService from '@app/services/game/game.service';
import { INVALID_COMMAND } from './command-errors';

describe('InputParserService', () => {
    const VALID_MESSAGE = 'this is a regular message';
    const VALID_LOCATION_INPUT = 'b12h';
    const VALID_LETTERS_INPUT = 'abc';

    const VALID_PLACE_INPUT = `!placer ${VALID_LOCATION_INPUT} ${VALID_LETTERS_INPUT}`;
    const VALID_EXCHANGE_INPUT = `!échanger ${VALID_LETTERS_INPUT}`;
    const VALID_PASS_INPUT = '!passer';
    const VALID_RESERVE_INPUT = '!réserve';
    const VALID_HINT_INPUT = '!indice';
    const VALID_HELP_INPUT = '!aide';

    const EXPECTED_PLACE_PAYLOAD: ActionPlacePayload = {
        tiles: [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1)],
        startPosition: { row: 1, column: 11 },
        orientation: Orientation.Horizontal,
    };
    const EXPECTED_EXCHANGE_PAYLOAD: ActionExchangePayload = {
        tiles: [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1)],
    };

    let service: InputParserService;
    const inputControllerSpy: jasmine.SpyObj<InputControllerService> = jasmine.createSpyObj('InputControllerService', [
        'sendPlaceAction',
        'sendExchangeAction',
        'sendPassAction',
        'sendReserveAction',
        'sendHintAction',
        'sendHelpAction',
        'sendMessage',
    ]);
    const gameServiceSpy: jasmine.SpyObj<GameService> = jasmine.createSpyObj('GameService', ['getLocalPlayer']);
    gameServiceSpy.getLocalPlayer.and.returnValue({
        name: 'testPlayer',
        score: 200,
        tiles: [
            new Tile('A' as LetterValue, 1),
            new Tile('B' as LetterValue, 1),
            new Tile('C' as LetterValue, 1),
            new Tile('D' as LetterValue, 1),
            new Tile('E' as LetterValue, 1),
            new Tile('F' as LetterValue, 1),
            new Tile('*' as LetterValue, 1),
        ],
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                InputParserService,
                { provide: InputControllerService, useValue: inputControllerSpy },
                { provide: GameService, useValue: gameServiceSpy },
            ],
        });
        service = TestBed.inject(InputParserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getOrientation should throw invalid command if orientation string is invalid', () => {
        const invalidOrientationStrings: string[] = ['vh', 'H', 'V', 'j', 'K', '*', '8'];

        for (const invalidOrientationString of invalidOrientationStrings) {
            expect(() => {
                service['getOrientation'](invalidOrientationString);
            }).toThrowError(INVALID_COMMAND);
        }
    });

    it('getOrientation should return valid orientation if orientation string is valid', () => {
        const validLocationStrings: string[] = ['v', 'h'];

        expect(service['getOrientation'](validLocationStrings[0])).toBe(Orientation.Vertical);
        expect(service['getOrientation'](validLocationStrings[1])).toBe(Orientation.Horizontal);
    });

    it('getStartPosition should throw invalid command if location string is invalid', () => {
        const invalidLocationStrings: string[] = ['abcde', 'g', 'a143', 'A12', 'B3', '%4', 'a17', 'f0', 'o0', '14a'];

        for (const invalidLocationString of invalidLocationStrings) {
            expect(() => {
                service['getStartPosition'](invalidLocationString);
            }).toThrowError(INVALID_COMMAND);
        }
    });

    it('getStartPosition should return valid Position if location string is valid', () => {
        const validLocationStrings: string[] = ['a1', 'a15', 'b12', 'g12', 'f1', 'm12', 'o15', 'o1'];
        const expectedPositions: Position[] = [
            { row: 0, column: 0 },
            { row: 0, column: 14 },
            { row: 1, column: 11 },
            { row: 6, column: 11 },
            { row: 5, column: 0 },
            { row: 12, column: 11 },
            { row: 14, column: 14 },
            { row: 14, column: 0 },
        ];

        for (let i = 0; i < validLocationStrings.length; i++) {
            expect(service['getStartPosition'](validLocationStrings[i])).toEqual(expectedPositions[i]);
        }
    });

    it('parseExchangeLettersToTiles should return valid tiles with valid input', () => {
        const validLetters = ['abcde', 'abcde', 'ab*'];
        const expectedTiles: Tile[][] = [
            [
                new Tile('A' as LetterValue, 1),
                new Tile('B' as LetterValue, 1),
                new Tile('C' as LetterValue, 1),
                new Tile('D' as LetterValue, 1),
                new Tile('E' as LetterValue, 1),
            ],
            [
                new Tile('A' as LetterValue, 1),
                new Tile('B' as LetterValue, 1),
                new Tile('C' as LetterValue, 1),
                new Tile('D' as LetterValue, 1),
                new Tile('E' as LetterValue, 1),
            ],
            [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('*' as LetterValue, 1)],
        ];

        for (let i = 0; i < validLetters.length; i++) {
            expect(service['parseExchangeLettersToTiles'](validLetters[i])).toEqual(expectedTiles[i]);
        }
    });

    it('parseExchangeLettersToTiles should throw INVALID_COMMAND with invalid input', () => {
        const invalidLetters = ['a&c"e', 'abcdefghiklm', 'lmno', 'ABCD', 'aaaa'];

        for (const invalidInput of invalidLetters) {
            expect(() => {
                service['parseExchangeLettersToTiles'](invalidInput);
            }).toThrowError(INVALID_COMMAND);
        }
    });

    it('parsePlaceLettersToTiles should return valid tiles with valid input', () => {
        const validLetters = ['abcde', 'abcde', 'efX', 'bKcd'];
        const expectedTiles: Tile[][] = [
            [
                new Tile('A' as LetterValue, 1),
                new Tile('B' as LetterValue, 1),
                new Tile('C' as LetterValue, 1),
                new Tile('D' as LetterValue, 1),
                new Tile('E' as LetterValue, 1),
            ],
            [
                new Tile('A' as LetterValue, 1),
                new Tile('B' as LetterValue, 1),
                new Tile('C' as LetterValue, 1),
                new Tile('D' as LetterValue, 1),
                new Tile('E' as LetterValue, 1),
            ],
            [new Tile('E' as LetterValue, 1), new Tile('F' as LetterValue, 1), new Tile('X' as LetterValue, 1)],
            [new Tile('B' as LetterValue, 1), new Tile('K' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('D' as LetterValue, 1)],
        ];

        for (let i = 0; i < validLetters.length; i++) {
            expect(service['parsePlaceLettersToTiles'](validLetters[i])).toEqual(expectedTiles[i]);
        }
    });

    it('parsePlanLettersToTiles should throw INVALID_COMMAND with invalid input', () => {
        const invalidLetters = ['a&c"e', 'abcdefghiklm', 'lmno', 'ABCD', 'aAB', 'aKL'];
        for (const invalidInput of invalidLetters) {
            expect(() => {
                service['parsePlaceLettersToTiles'](invalidInput);
            }).toThrowError(INVALID_COMMAND);
        }
    });

    it('createExchangeActionPayload should call parseExchangeLettersToTiles', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const exchangeParserSpy = spyOn<any>(service, 'parseExchangeLettersToTiles');
        service['createExchangeActionPayload'](VALID_LETTERS_INPUT);
        expect(exchangeParserSpy).toHaveBeenCalled();
    });

    it('createExchangeActionPayload should return expected payload', () => {
        expect(service['createExchangeActionPayload'](VALID_LETTERS_INPUT)).toEqual(EXPECTED_EXCHANGE_PAYLOAD);
    });

    it('createPlaceActionPayload should call parsePlaceLettersToTiles', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const placeParserSpy = spyOn<any>(service, 'parsePlaceLettersToTiles');
        service['createPlaceActionPayload'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT);
        expect(placeParserSpy).toHaveBeenCalled();
    });

    it('createPlaceActionPayload should call getStartPosition', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const positionSpy = spyOn<any>(service, 'getStartPosition');
        service['createPlaceActionPayload'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT);
        expect(positionSpy).toHaveBeenCalled();
    });

    it('createPlaceActionPayload should call getOrientation', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orientationSpy = spyOn<any>(service, 'getOrientation');
        service['createPlaceActionPayload'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT);
        expect(orientationSpy).toHaveBeenCalled();
    });

    it('createPlaceActionPayload should return expected payload', () => {
        expect(service['createPlaceActionPayload'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT)).toEqual(EXPECTED_PLACE_PAYLOAD);
    });

    it('parseInput should call sendMessage if input doesnt start with !', () => {
        service.parseInput(VALID_MESSAGE);
        expect(inputControllerSpy.sendMessage).toHaveBeenCalledWith(VALID_MESSAGE);
    });

    it('parseInput should call sendPlaceAction if input is a valid place command', () => {
        service.parseInput(VALID_PLACE_INPUT);
        expect(inputControllerSpy.sendPlaceAction).toHaveBeenCalledWith(EXPECTED_PLACE_PAYLOAD);
    });

    it('parseInput should call sendExchangeAction if input is a valid exchange command', () => {
        service.parseInput(VALID_EXCHANGE_INPUT);
        expect(inputControllerSpy.sendExchangeAction).toHaveBeenCalledWith(EXPECTED_EXCHANGE_PAYLOAD);
    });

    it('parseInput should call sendPassAction if input is a valid pass command', () => {
        service.parseInput(VALID_PASS_INPUT);
        expect(inputControllerSpy.sendPassAction).toHaveBeenCalled();
    });

    it('parseInput should call sendReserveAction if input is a valid reserve command', () => {
        service.parseInput(VALID_RESERVE_INPUT);
        expect(inputControllerSpy.sendReserveAction).toHaveBeenCalled();
    });

    it('parseInput should call sendHintAction if input is a valid hint command', () => {
        service.parseInput(VALID_HINT_INPUT);
        expect(inputControllerSpy.sendHintAction).toHaveBeenCalled();
    });

    it('parseInput should call sendHelpAction if input is a valid help command', () => {
        service.parseInput(VALID_HELP_INPUT);
        expect(inputControllerSpy.sendHelpAction).toHaveBeenCalled();
    });

    it('parseInput should throw INVALID_COMMAND if commands have incorrect lengths', () => {
        const invalidCommands = [
            '!placer abc',
            '!échanger one two three',
            '!passer thing',
            '!réserve second word',
            '!indice not length of two',
            '!aide help',
        ];

        for (const invalidCommand of invalidCommands) {
            expect(() => {
                service.parseInput(invalidCommand);
            }).toThrowError(INVALID_COMMAND);
        }
    });
});
