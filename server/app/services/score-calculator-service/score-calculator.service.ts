import { BINGO_BONUS_POINTS, MAX_TILES_PER_PLAYER } from '@app/classes/actions/action-place/action-place.const';
import { Square } from '@app/classes/square';
import { MultiplierEffect } from '@app/classes/square/score-multiplier';
import { Tile } from '@app/classes/tile';
import { DEFAULT_MULTIPLIER, DEFAULT_SCORE } from '@app/constants/services-constants/score-calculator.const';
import { Service } from 'typedi';

@Service()
export class ScoreCalculatorService {
    calculatePoints(wordsToScore: [Square, Tile][][]): number {
        return wordsToScore.reduce((total, word) => (total += this.calculatePointsPerWord(word)), DEFAULT_SCORE);
    }

    bonusPoints(tilesToPlace: Tile[]): number {
        return this.isABingo(tilesToPlace) ? BINGO_BONUS_POINTS : 0;
    }

    isABingo(tilesToPlace: Tile[]): boolean {
        return tilesToPlace.length === MAX_TILES_PER_PLAYER;
    }

    private calculatePointsPerWord(word: [Square, Tile][]): number {
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
        }
        return tile.value;
    }

    private wordMultiplier(square: Square): number {
        if (square.scoreMultiplier?.multiplierEffect === MultiplierEffect.WORD && !square.wasMultiplierUsed) {
            return square.scoreMultiplier.multiplier;
        }
        return DEFAULT_MULTIPLIER;
    }
}
