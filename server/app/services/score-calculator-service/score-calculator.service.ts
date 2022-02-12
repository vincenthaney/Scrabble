import { Square } from '@app/classes/square';
import { MultiplierEffect } from '@app/classes/square/score-multiplier';
import { Tile } from '@app/classes/tile';
import { Service } from 'typedi';
import { DEFAULT_MULTIPLIER, DEFAULT_SCORE } from '@app/constants/services-constants/score-calculator.const';

@Service()
export class ScoreCalculatorService {
    calculatePoints(wordsToScore: [Tile, Square][][]) {
        return wordsToScore.reduce((total, word) => (total += this.calculatePointsPerWord(word)), DEFAULT_SCORE);
    }

    private calculatePointsPerWord(word: [Tile, Square][]) {
        let wordScore = DEFAULT_SCORE;
        let wordMultiplier = DEFAULT_MULTIPLIER;

        word.forEach(([tile, square]) => {
            wordScore += this.letterValue(tile, square);
            wordMultiplier *= this.wordMultiplier(square);
        });
        return (wordScore *= wordMultiplier);
    }

    private letterValue(tile: Tile, square: Square): number {
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
