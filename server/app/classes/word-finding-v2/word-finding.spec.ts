import { Board, Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { Container } from 'typedi';
import WordFindingRequest from '../word-finding/word-finding-request';
import WordFindingUseCase from '../word-finding/word-finding-use-case';
import { ScoredWordPlacement } from '../word-finding/word-placement';
import WordFinding from './word-finding';
import { BoardPlacement, DictionarySearchResult } from './word-finding-types';

type LetterValues = (LetterValue | ' ')[][];

const GRID: LetterValues = [
//    0    1    2    3    4    5    6    7    8    9   10   11   12   13   14 
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'B', ' ', ' ', ' ', ' ', ' '], // 0
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'A', ' ', ' ', ' ', ' ', 'P'], // 1
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'R', ' ', ' ', ' ', ' ', 'A'], // 2
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'B', 'A', 'R', 'R', 'E', ' ', ' ', 'R'], // 3
    [' ', ' ', ' ', 'P', ' ', ' ', ' ', 'O', ' ', 'E', ' ', 'T', ' ', ' ', 'T'], // 4
    [' ', ' ', 'D', 'E', 'V', 'I', 'E', 'N', 'T', ' ', ' ', 'R', ' ', ' ', 'O'], // 5
    [' ', ' ', ' ', 'P', ' ', ' ', ' ', 'J', ' ', ' ', 'S', 'A', 'L', 'O', 'N'], // 6
    [' ', ' ', ' ', 'A', ' ', ' ', ' ', 'O', ' ', ' ', ' ', 'N', ' ', ' ', 'S'], // 7
    [' ', ' ', ' ', 'R', ' ', 'R', 'O', 'U', 'E', 'S', ' ', 'G', ' ', ' ', ' '], // 8
    [' ', ' ', ' ', 'E', ' ', 'O', ' ', 'R', ' ', 'O', ' ', 'E', ' ', ' ', ' '], // 9
    [' ', ' ', ' ', ' ', ' ', 'U', ' ', ' ', ' ', 'L', ' ', ' ', ' ', ' ', ' '], // 10
    [' ', ' ', ' ', ' ', ' ', 'G', ' ', ' ', ' ', 'I', ' ', ' ', ' ', ' ', ' '], // 11
    [' ', ' ', ' ', ' ', ' ', 'E', ' ', ' ', ' ', 'D', ' ', ' ', ' ', ' ', ' '], // 12
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'C', 'R', 'E', 'T', 'I', 'N', 'S', ' '], // 13
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 14
];

const boardFromLetterValues = (letterValues: LetterValues) => {
    const grid: Square[][] = [];

    letterValues.forEach((line, row) => {
        const boardRow: Square[] = [];

        line.forEach((letter, column) => {
            boardRow.push({
                tile: letter === ' ' ? null : { letter: letter as LetterValue, value: 1 },
                position: new Position(row, column),
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: false,
            });
        });

        grid.push(boardRow);
    });
    grid[7][7].isCenter = true;
    return new Board(grid);
};

const lettersToTiles = (letters: LetterValue[]) => letters.map<Tile>((letter) => ({ letter, value: 0 }));

interface Benchmark {
    findWordsDuration: number;
    getWordPlacementDuration: number;
    extractWordSquareTileDuration: number;
    extractPerpendicularWordsSquareTileDuration: number;
}

class WordFindingBenchmark extends WordFinding implements Benchmark {
    findWordsDuration: number;
    getWordPlacementDuration: number;
    extractWordSquareTileDuration: number;
    extractPerpendicularWordsSquareTileDuration: number;

    findWords(): ScoredWordPlacement[] {
        const start = Date.now();
        const result = super.findWords();
        this.findWordsDuration = Date.now() - start;
        return result;
    }

    getWordPlacement(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): ScoredWordPlacement {
        const start = Date.now();
        const result = super.getWordPlacement(wordResult, boardPlacement);
        this.getWordPlacementDuration = Date.now() - start;
        return result;
    }

    extractWordSquareTile(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): [Square, Tile][] {
        const start = Date.now();
        const result = super.extractWordSquareTile(wordResult, boardPlacement);
        this.extractWordSquareTileDuration = Date.now() - start;
        return result;
    }

    extractPerpendicularWordsSquareTile(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): [Square, Tile][][] {
        const start = Date.now();
        const result = super.extractPerpendicularWordsSquareTile(wordResult, boardPlacement);
        this.extractPerpendicularWordsSquareTileDuration = Date.now() - start;
        return result;
    }

    print() {
        console.log(
            // eslint-disable-next-line max-len
            `Total: ${this.findWordsDuration}ms \n\tgetWordPlacement: ${this.getWordPlacementDuration} ms\n\t\textractWordSquareTile: ${this.extractWordSquareTileDuration} ms\n\t\textractPerpendicularWordsSquareTile:${this.extractPerpendicularWordsSquareTileDuration} ms`,
        );
    }
}

describe.only('WordFinding', () => {
    it('should work', () => {
        const board = boardFromLetterValues(GRID);
        const dictionary = Container.get(DictionaryService).getDefaultDictionary();
        const tiles = lettersToTiles(['A', 'B', 'S', 'T', 'M', 'E', '*']);
        const request: WordFindingRequest = {
            useCase: WordFindingUseCase.Beginner,
            pointRange: { minimum: 4, maximum: 100 },
        };

        const iterations = 2;
        let totalTime = 0;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        for (let i = 0; i < iterations; ++i) {
            console.log(`========== TEST ${i + 1} ==========`);
            const start = Date.now();
            const wordFinding = new WordFindingBenchmark(board, tiles, request, dictionary);
            wordFinding.findWords();
            totalTime += Date.now() - start;
            // wordFinding.print();
        }

        console.log(`runned ${iterations} times in ${totalTime} ms (${totalTime / iterations} ms avr.)`);
    });
});
