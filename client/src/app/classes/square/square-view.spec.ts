/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { COLORS } from '@app/constants/colors';
import { SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game';
import { ScoreMultiplier, Square, SquareView } from '.';
import { MultiplierEffect } from './score-multiplier';
import * as SQUARE_ERRORS from './square-errors';

interface ColorTestCase {
    multiplierName: string;
    multiplier: ScoreMultiplier;
    expectedColor: COLORS;
}

interface GetTextTestCase {
    multiplierName: string;
    multiplier: ScoreMultiplier;
    expectedText: [string, string];
}

class SquareViewWrapper {
    squareView: SquareView;
    private pSquare: Square;

    createSquareView() {
        this.squareView = new SquareView(this.square, SQUARE_SIZE);
    }
    get square(): Square {
        return this.pSquare;
    }

    set square(square: Square) {
        this.pSquare = square;
    }
}
describe('SquareView', () => {
    const validColorTestCases: ColorTestCase[] = [
        {
            multiplierName: '2x Letter Multiplier',
            multiplier: { multiplier: 2, multiplierEffect: MultiplierEffect.LETTER },
            expectedColor: COLORS.Letter2x,
        },
        {
            multiplierName: '3x Letter Multiplier',
            multiplier: { multiplier: 3, multiplierEffect: MultiplierEffect.LETTER },
            expectedColor: COLORS.Letter3x,
        },
        {
            multiplierName: '2x Word Multiplier',
            multiplier: { multiplier: 2, multiplierEffect: MultiplierEffect.WORD },
            expectedColor: COLORS.Word2x,
        },
        {
            multiplierName: '3x Word Multiplier',
            multiplier: { multiplier: 3, multiplierEffect: MultiplierEffect.WORD },
            expectedColor: COLORS.Word3x,
        },
    ];

    const validTextTestCase: GetTextTestCase[] = [
        {
            multiplierName: '2x Letter Multiplier',
            multiplier: { multiplier: 2, multiplierEffect: MultiplierEffect.LETTER },
            expectedText: ['Lettre', '2'],
        },
        {
            multiplierName: '3x Letter Multiplier',
            multiplier: { multiplier: 3, multiplierEffect: MultiplierEffect.LETTER },
            expectedText: ['Lettre', '3'],
        },
        { multiplierName: '2x Word Multiplier', multiplier: { multiplier: 2, multiplierEffect: MultiplierEffect.WORD }, expectedText: ['Mot', '2'] },
        { multiplierName: '3x Word Multiplier', multiplier: { multiplier: 3, multiplierEffect: MultiplierEffect.WORD }, expectedText: ['Mot', '3'] },
    ];

    it('SquareView with no Square associated should throw error when getting color', () => {
        const squareViewWrapper = new SquareViewWrapper();
        spyOnProperty(squareViewWrapper, 'square', 'get').and.returnValue(null);
        squareViewWrapper.createSquareView();

        expect(() => squareViewWrapper.squareView.getColor()).toThrowError(SQUARE_ERRORS.NO_SQUARE_FOR_SQUARE_VIEW);
    });

    it('SquareView with no Square Multiplier should give default square color', () => {
        const squareView = new SquareView(UNDEFINED_SQUARE, SQUARE_SIZE);
        expect(squareView.getColor()).toEqual(COLORS.Gray);
    });

    validColorTestCases.forEach((testCase: ColorTestCase) => {
        const testText = testCase.multiplierName;
        const multiplier = testCase.multiplier;
        const expectedColor = testCase.expectedColor;

        it('SquareView with ' + testText + ' should be of color' + expectedColor, () => {
            const square = {
                tile: null,
                position: { row: 0, column: 0 },
                scoreMultiplier: multiplier,
                wasMultiplierUsed: false,
                isCenter: false,
            };
            const squareView = new SquareView(square, SQUARE_SIZE);
            expect(squareView.getColor()).toEqual(expectedColor);
        });
    });

    it('SquareView with invalid score multiplier effect should throw error', () => {
        // We need to mock the ScoreMultiplier to have null score MultiplierEffect
        const nullMultiplierEffectSpy = jasmine.createSpyObj(
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
            position: { row: 0, column: 0 },
            scoreMultiplier: nullMultiplierEffectSpy,
            wasMultiplierUsed: false,
            isCenter: false,
        };
        const squareView = new SquareView(square, SQUARE_SIZE);
        expect(() => squareView.getColor()).toThrowError(SQUARE_ERRORS.NO_COLOR_FOR_MULTIPLIER);
    });

    it('SquareView with invalid score multiplier should throw error', () => {
        // We need to mock the ScoreMultiplier to have invalid score multipliers
        const negativeMultiplierSpy = jasmine.createSpyObj(
            'AbstractScoreMultiplier',
            {
                getMultiplier: () => {
                    return -1;
                },
                getMultiplierEffect: () => {
                    // We can create an actual MultiplierEffect since it won't impact the getMultiplier
                    return { multiplier: 2, multiplierEffect: MultiplierEffect.LETTER };
                },
            },
            { multiplier: -1, multiplierEffect: { multiplier: 2, multiplierEffect: MultiplierEffect.LETTER } },
        );
        const square = {
            tile: null,
            position: { row: 0, column: 0 },
            scoreMultiplier: negativeMultiplierSpy,
            wasMultiplierUsed: false,
            isCenter: false,
        };
        const squareView = new SquareView(square, SQUARE_SIZE);
        expect(() => squareView.getColor()).toThrowError(SQUARE_ERRORS.NO_COLOR_FOR_MULTIPLIER);
    });

    it('SquareView with no Square associated should throw error when getting text', () => {
        const squareViewWrapper = new SquareViewWrapper();
        spyOnProperty(squareViewWrapper, 'square', 'get').and.returnValue(null);
        squareViewWrapper.createSquareView();

        expect(() => squareViewWrapper.squareView.getText()).toThrowError(SQUARE_ERRORS.NO_SQUARE_FOR_SQUARE_VIEW);
    });

    it('SquareView with no square multiplier should return no text', () => {
        const squareView = new SquareView(UNDEFINED_SQUARE, SQUARE_SIZE);
        expect(squareView.getText()).toEqual([undefined, undefined]);
    });

    it('SquareView with square which is the center should return no text', () => {
        const square = UNDEFINED_SQUARE;
        square.isCenter = true;
        const squareView = new SquareView(square, SQUARE_SIZE);
        expect(squareView.getText()).toEqual([undefined, undefined]);
    });

    validTextTestCase.forEach((testCase: GetTextTestCase) => {
        const testText = testCase.multiplierName;
        const multiplier = testCase.multiplier;
        const expectedText = testCase.expectedText;

        it('SquareView with ' + testText + ' should have text: ' + expectedText, () => {
            const square = {
                tile: null,
                position: { row: 0, column: 0 },
                scoreMultiplier: multiplier,
                wasMultiplierUsed: false,
                isCenter: false,
            };
            const squareView = new SquareView(square, SQUARE_SIZE);
            expect(squareView.getText()).toEqual(expectedText);
        });
    });
});
