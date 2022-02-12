import { Square } from '@app/classes/square';
import { MultiplierEffect } from '@app/classes/square/score-multiplier';
import { Tile } from '@app/classes/tile';
import { Service } from 'typedi';
import { scoreCalculatorConstants } from '@app/constants/services-constants/score-calculator.const';

@Service()
export class ScoreCalculatorService {
    calculatePoints(wordsToScore: [Tile, Square][][]) {
        return wordsToScore.reduce((total, word) => (total += this.calculatePointsPerWord(word)), scoreCalculatorConstants.DEFAULT_SCORE);
    }

    private calculatePointsPerWord(word: [Tile, Square][]) {
        let wordScore = scoreCalculatorConstants.DEFAULT_SCORE;
        let wordMultiplier = scoreCalculatorConstants.DEFAULT_MULTIPLIER;

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
            return scoreCalculatorConstants.DEFAULT_MULTIPLIER;
        }
    }
}
