import { Square } from '@app/classes/square';
import { MultiplierEffect } from '@app/classes/square/score-multiplier';
import { Tile } from '@app/classes/tile';
import { Service } from 'typedi';
import { DEFAULT_MULTIPLIER, DEFAULT_SCORE } from './score-calculator.service.const';

@Service()
export class ScoreCalculatorService {
    // calculatePoints(wordsToScore: [Tile, Square][][]) {
    calculatePoints(wordsToScore: [Square, Tile][][]) {
        return wordsToScore.reduce((total, word) => (total += this.calculatePointsPerWord(word)), DEFAULT_SCORE);
    }

    // private calculatePointsPerWord(word: [Tile, Square][]) {
    private calculatePointsPerWord(word: [Square, Tile][]) {
        let wordScore = DEFAULT_SCORE;
        let wordMultiplier = DEFAULT_MULTIPLIER;

        word.forEach(([square, tile]) => {
            wordScore += this.letterValue(square, tile);
            wordMultiplier *= this.wordMultiplier(square);
        });
        return (wordScore *= wordMultiplier);
    }

    private letterValue(square: Square, tile: Tile): number {
        if (square.scoreMultiplier?.multiplierEffect === MultiplierEffect.LETTER && !square.wasMultiplierUsed) {
            return tile.value * square.scoreMultiplier.multiplier;
        } else {
            return tile.value;
        }
    }

    private wordMultiplier(square: Square): number {
        if (square.scoreMultiplier?.multiplierEffect === MultiplierEffect.WORD && !square.wasMultiplierUsed) {
            return square.scoreMultiplier.multiplier;
        } else {
            return DEFAULT_MULTIPLIER;
        }
    }
}
