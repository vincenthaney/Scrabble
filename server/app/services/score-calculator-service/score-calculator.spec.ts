// Lint dot-notation must be disabled to access private element
/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */
import { Square } from '@app/classes/square';
import { MultiplierEffect } from '@app/classes/square/score-multiplier';
import { Tile } from '@app/classes/tile';
import { expect } from 'chai';
import {
    EMPTY_WORDS,
    EMPTY_WORD,
    DEFAULT_TILE_VALUE,
    DEFAULT_WORD_MULTIPLIER,
    DEFAULT_LETTER_MULTIPLIER,
    USED_MULTIPLIER,
    GENERIC_WORDS,
    NOT_USED_MULTIPLIER,
    GENERIC_WORDS_SCORE,
    GENERIC_LETTER_3,
} from './score-calculator.const.test';
import { ScoreCalculatorService } from './score-calculator.service';
import { DEFAULT_MULTIPLIER } from './score-calculator.service.const';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { Position } from '@app/classes/board';

chai.use(spies);
chai.use(chaiAsPromised);

describe('ScoreCalculatorService', () => {
    let scoreCalculatorService: ScoreCalculatorService;
    let testTile: Tile;
    let testSquare: Square;
    let testTuple: [Tile, Square];
    beforeEach(() => {
        scoreCalculatorService = new ScoreCalculatorService();
        testTile = { letter: 'X', value: DEFAULT_TILE_VALUE };
        testSquare = {
            tile: null,
            position: new Position(0, 0),
            scoreMultiplier: null,
            wasMultiplierUsed: false,
            isCenter: false,
        };
        testTuple = [testTile, testSquare];
    });

    afterEach(() => {
        chai.spy.restore();
    });

    it('should create', () => {
        expect(scoreCalculatorService).to.exist;
    });

    it('should return 0', () => {
        expect(scoreCalculatorService.calculatePoints(EMPTY_WORDS)).to.equal(0);
    });

    it('should call letterMultiplier ', () => {
        const spy = chai.spy.on(scoreCalculatorService, 'letterValue');
        scoreCalculatorService.calculatePoints(GENERIC_WORDS);
        expect(spy).to.be.called();
    });

    it('should call wordMultiplier', () => {
        const spy = chai.spy.on(scoreCalculatorService, 'wordMultiplier');
        scoreCalculatorService.calculatePoints(GENERIC_WORDS);
        expect(spy).to.be.called();
    });

    it('should call calculatePointsPerWord', () => {
        const spy = chai.spy.on(scoreCalculatorService, 'calculatePointsPerWord');
        scoreCalculatorService.calculatePoints(GENERIC_WORDS);
        expect(spy).to.be.called();
    });

    it('should return default multiplier "1"', () => {
        expect(scoreCalculatorService['wordMultiplier'](testSquare)).to.equal(DEFAULT_MULTIPLIER);
    });

    it('should return wordMultiplier', () => {
        testSquare.scoreMultiplier = { multiplier: DEFAULT_WORD_MULTIPLIER, multiplierEffect: MultiplierEffect.WORD };
        expect(scoreCalculatorService['wordMultiplier'](testSquare)).to.equal(testSquare.scoreMultiplier?.multiplier);
    });

    it('should return modified letter value ', () => {
        testSquare.scoreMultiplier = { multiplier: DEFAULT_LETTER_MULTIPLIER, multiplierEffect: MultiplierEffect.LETTER };
        const expectedValue = DEFAULT_TILE_VALUE * DEFAULT_LETTER_MULTIPLIER;
        expect(scoreCalculatorService['letterValue'](testTile, testSquare)).to.equal(expectedValue);
    });

    it('should return original tile value because square has no multiplier', () => {
        const expectedValue = DEFAULT_TILE_VALUE;
        expect(scoreCalculatorService['letterValue'](testTile, testSquare)).to.equal(expectedValue);
    });

    it('should return modified tile value because square letter multiplier has not been used', () => {
        testSquare.scoreMultiplier = { multiplier: DEFAULT_LETTER_MULTIPLIER, multiplierEffect: MultiplierEffect.LETTER };
        testSquare.wasMultiplierUsed = NOT_USED_MULTIPLIER;
        const expectedValue = DEFAULT_TILE_VALUE * DEFAULT_LETTER_MULTIPLIER;
        expect(scoreCalculatorService['letterValue'](testTile, testSquare)).to.equal(expectedValue);
    });

    it('should return original tile value because square letter multiplier has already been used', () => {
        testSquare.scoreMultiplier = { multiplier: DEFAULT_LETTER_MULTIPLIER, multiplierEffect: MultiplierEffect.LETTER };
        testSquare.wasMultiplierUsed = USED_MULTIPLIER;
        const expectedValue = DEFAULT_TILE_VALUE;
        expect(scoreCalculatorService['letterValue'](testTile, testSquare)).to.equal(expectedValue);
    });

    it('should return 0 points', () => {
        const expectedPoints = 0;
        const testWord = EMPTY_WORD;
        expect(scoreCalculatorService['calculatePointsPerWord'](testWord)).to.equal(expectedPoints);
    });

    it('should return score with multipliers not applied because letter multiplier was used', () => {
        testSquare.scoreMultiplier = { multiplier: DEFAULT_LETTER_MULTIPLIER, multiplierEffect: MultiplierEffect.LETTER };
        testSquare.wasMultiplierUsed = USED_MULTIPLIER;
        testTile.value = DEFAULT_TILE_VALUE;
        const testMultiplierUsedWord = [GENERIC_LETTER_3, testTuple];
        const expectedScore = GENERIC_LETTER_3[0].value + DEFAULT_TILE_VALUE;
        expect(scoreCalculatorService['calculatePointsPerWord'](testMultiplierUsedWord)).to.equal(expectedScore);
    });

    it('should return score with multipliers applied because letter multiplier was not used ', () => {
        testSquare.scoreMultiplier = { multiplier: DEFAULT_LETTER_MULTIPLIER, multiplierEffect: MultiplierEffect.LETTER };
        testSquare.wasMultiplierUsed = NOT_USED_MULTIPLIER;
        testTile.value = DEFAULT_TILE_VALUE;
        const testMultiplierNotUsedWord = [GENERIC_LETTER_3, testTuple];
        const expectedScore = GENERIC_LETTER_3[0].value + DEFAULT_TILE_VALUE * DEFAULT_LETTER_MULTIPLIER;
        expect(scoreCalculatorService['calculatePointsPerWord'](testMultiplierNotUsedWord)).to.equal(expectedScore);
    });

    it('should return score with multipliers not applied because word multipliers were used ', () => {
        testSquare.scoreMultiplier = { multiplier: DEFAULT_LETTER_MULTIPLIER, multiplierEffect: MultiplierEffect.WORD };
        testSquare.wasMultiplierUsed = USED_MULTIPLIER;
        testTile.value = DEFAULT_TILE_VALUE;
        const testMultiplierNotUsedWord = [GENERIC_LETTER_3, testTuple];
        const expectedScore = GENERIC_LETTER_3[0].value + DEFAULT_TILE_VALUE;
        expect(scoreCalculatorService['calculatePointsPerWord'](testMultiplierNotUsedWord)).to.equal(expectedScore);
    });

    it('should return score with multipliers applied because word multipliers were not used ', () => {
        testSquare.scoreMultiplier = { multiplier: DEFAULT_LETTER_MULTIPLIER, multiplierEffect: MultiplierEffect.WORD };
        testSquare.wasMultiplierUsed = NOT_USED_MULTIPLIER;
        testTile.value = DEFAULT_TILE_VALUE;
        const testMultiplierNotUsedWord = [GENERIC_LETTER_3, testTuple];
        const expectedScore = (GENERIC_LETTER_3[0].value + DEFAULT_TILE_VALUE) * DEFAULT_WORD_MULTIPLIER;
        expect(scoreCalculatorService['calculatePointsPerWord'](testMultiplierNotUsedWord)).to.equal(expectedScore);
    });

    it('should return same value as calculated (with letter and word multipliers)', () => {
        const expectedPoints = GENERIC_WORDS_SCORE;
        const testWord = GENERIC_WORDS;
        expect(scoreCalculatorService.calculatePoints(testWord)).to.equal(expectedPoints);
    });
});
