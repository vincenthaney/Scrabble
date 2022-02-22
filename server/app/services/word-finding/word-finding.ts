import { Board } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordFindingRequest, WordPlacement } from '@app/classes/word-finding';
import { Service } from 'typedi';
// import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
// import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
// import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';

@Service()
export default class WordFindingService {
    // constructor(
    //     private wordExtraction: WordExtraction,
    //     private wordVerification: WordsVerificationService,
    //     private scoreCalculator: ScoreCalculatorService,
    // ) {}

    // eslint-disable-next-line no-unused-vars
    findWords(board: Board, tiles: Tile[], query: WordFindingRequest): WordPlacement[] {
        const pivotSquares = board.getPlacedTileSquares();
        const pivotSquare = pivotSquares[Math.floor(Math.random() * pivotSquares.length)];


        throw new Error('not implemented');
    }


    // findPermutations(word: string): string[] {
    //     if (word.length < 2) {
    //         return [word];
    //     }

    //     const permutationsArray = [];

    //     for (let i = 0; i < word.length; i++) {
    //         const char = word[i];

    //         if (word.indexOf(char) !== i) continue;

    //         const remainingChars = word.slice(0, i) + word.slice(i + 1, word.length);

    //         for (const permutation of this.findPermutations(remainingChars)) {
    //             permutationsArray.push(char + permutation);
    //         }
    //     }
    //     return permutationsArray;
    // }

    findPermutations(tiles: Tile[]): Tile[][] {
        if (tiles.length < 2) {
            return [tiles];
        }

        const permutationsArray = [];

        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];

            if (tiles.indexOf(tile) !== i) continue;

            const remainingChars = tiles.slice(0, i).concat(tiles.slice(i + 1, tiles.length));

            for (const permutation of this.findPermutations(remainingChars)) {
                permutationsArray.push([tile].concat(permutation));
            }
        }
        return permutationsArray;
    }
}
