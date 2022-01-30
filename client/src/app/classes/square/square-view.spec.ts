/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { COLORS } from '@app/constants/colors';
import { SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game';
import { AbstractScoreMultiplier, LetterScoreMultiplier, Square, SquareView, WordScoreMultiplier } from '.';
import * as SQUARE_ERRORS from './square-errors';

interface ColorTestCase {
    testCaseText: string;
    multiplier: AbstractScoreMultiplier;
    expectedColor: COLORS;
}

class SquareViewWrapper {
    psquare: Square;
    squareView: SquareView;

    createSquareView() {
        this.squareView = new SquareView(this.square, SQUARE_SIZE);
    }
    get square(): Square {
        return this.psquare;
    }

    set square(square: Square) {
        this.psquare = square;
    }
}
describe('SquareView', () => {
    const validColorTestCases: ColorTestCase[] = [
        { testCaseText: '2x Letter Multiplier', multiplier: new LetterScoreMultiplier(2), expectedColor: COLORS.Letter2x },
        { testCaseText: '3x Letter Multiplier', multiplier: new LetterScoreMultiplier(3), expectedColor: COLORS.Letter3x },
        { testCaseText: '2x Word Multiplier', multiplier: new WordScoreMultiplier(2), expectedColor: COLORS.Word2x },
        { testCaseText: '3x Word Multiplier', multiplier: new WordScoreMultiplier(3), expectedColor: COLORS.Word3x },
    ];

    it('SquareView with no Square associated should throw error', () => {
        const squareViewWrapper = new SquareViewWrapper();
        spyOnProperty(squareViewWrapper, 'square', 'get').and.returnValue(null);
        squareViewWrapper.createSquareView();

        // spyOnProperty(squareView, 'square').and.returnValue(null);
        expect(() => squareViewWrapper.squareView.getColor()).toThrowError(SQUARE_ERRORS.NO_SQUARE_FOR_SQUARE_VIEW);
    });

    it('SquareView with no Square Multiplier should give default square color', () => {
        const squareView = new SquareView(UNDEFINED_SQUARE, SQUARE_SIZE);
        expect(squareView.getColor()).toEqual(COLORS.Beige);
    });

    validColorTestCases.forEach((testCase: ColorTestCase) => {
        const testText = testCase.testCaseText;
        const multiplier = testCase.multiplier;
        const expectedColor = testCase.expectedColor;

        it('SquareView with ' + testText + ' should be of color' + expectedColor, () => {
            const square = {
                tile: null,
                multiplier,
                isMultiplierPlayed: false,
                isCenter: false,
            };
            const squareView = new SquareView(square, SQUARE_SIZE);
            expect(squareView.getColor()).toEqual(expectedColor);
        });
    });

    it('SquareView with invalid score multiplier effect should throw error', () => {
        const scoreMultiplierSpy = jasmine.createSpyObj(
            'AbstractScoreMultiplier',
            {
                getMultiplier: () => {
                    return 2;
                },
                getMultiplierEffect: () => {
                    return null;
                },
            },
            { multiplier: 2, multiplierEffect: null },
        );
        const square = {
            tile: null,
            multiplier: scoreMultiplierSpy,
            isMultiplierPlayed: false,
            isCenter: false,
        };
        const squareView = new SquareView(square, SQUARE_SIZE);
        expect(() => squareView.getColor()).toThrowError(SQUARE_ERRORS.NO_COLOR_FOR_MULTIPLIER);
    });

    it('SquareView with invalid score multiplier should throw error', () => {
        const scoreMultiplierSpy = jasmine.createSpyObj(
            'AbstractScoreMultiplier',
            {
                getMultiplier: () => {
                    return -1;
                },
                getMultiplierEffect: () => {
                    return new LetterScoreMultiplier(2);
                },
            },
            { multiplier: -1, multiplierEffect: new LetterScoreMultiplier(2) },
        );
        const square = {
            tile: null,
            multiplier: scoreMultiplierSpy,
            isMultiplierPlayed: false,
            isCenter: false,
        };
        const squareView = new SquareView(square, SQUARE_SIZE);
        expect(() => squareView.getColor()).toThrowError(SQUARE_ERRORS.NO_COLOR_FOR_MULTIPLIER);
    });
});
