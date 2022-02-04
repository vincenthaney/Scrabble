/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { Orientation } from '@app/classes/orientation';
import { Position } from '@app/classes/position';
import { InputControllerService } from '@app/controllers/input-controller/input-controller.service';
import { InputParserService } from '@app/services';
import { INVALID_COMMAND } from './command-errors';

describe('InputParserService', () => {
    let service: InputParserService;
    let inputControllerSpy: jasmine.SpyObj<InputControllerService>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: InputControllerService, useValue: inputControllerSpy }],
        });
        service = TestBed.inject(InputParserService);
        inputControllerSpy = jasmine.createSpyObj('InputControllerService', [
            'sendPlaceAction',
            'sendExchangeAction',
            'sendPassAction',
            'sendReserveAction',
            'sendHintAction',
            'sendHelpAction',
            'sendMessage',
        ]);
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
        const validLocationStrings: string[] = ['a1', 'a15', 'g12', 'f1', 'm12', 'o15', 'o1'];
        const expectedPositions: Position[] = [
            { row: 0, column: 0 },
            { row: 0, column: 14 },
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
});
