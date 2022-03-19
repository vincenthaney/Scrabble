import { Board, Orientation, Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { Container } from 'typedi';
import WordFindingRequest from '@app/classes/word-finding/word-finding-request';
import WordFindingUseCase from '@app/classes/word-finding/word-finding-use-case';
import { ScoredWordPlacement } from '@app/classes/word-finding/word-placement';
import WordFinding from './word-finding';

type LetterValues = (LetterValue | ' ')[][];

const GRID: LetterValues = [
    // 0   1    2    3    4    5    6    7    8    9   10   11   12   13   14
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

class WordFindingTest extends WordFinding {
    private bestWordPlacement: ScoredWordPlacement = {
        orientation: Orientation.Horizontal,
        startPosition: new Position(0, 0),
        tilesToPlace: [],
        score: 0,
    };

    handleWordPlacement(wordPlacement: ScoredWordPlacement): void {
        if (wordPlacement.score > this.bestWordPlacement.score) {
            this.bestWordPlacement = wordPlacement;
            this.wordPlacements = [wordPlacement];
        }
    }
    isSearchCompleted(): boolean {
        return false;
    }
}

describe.only('WordFinding', () => {
    it('should work', () => {
        const board = boardFromLetterValues(GRID);
        const dictionary = Container.get(DictionaryService).getDefaultDictionary();
        const scoreCalculator = Container.get(ScoreCalculatorService);
        const tiles = lettersToTiles(['A', 'B', 'S', '*', 'T', 'M', 'E']);
        const request: WordFindingRequest = {
            useCase: WordFindingUseCase.Beginner,
            pointRange: { minimum: 4, maximum: 100 },
        };

        const iterations = 10;
        let results: ScoredWordPlacement[] = [];
        let totalTime = 0;
        for (let i = 0; i < iterations; ++i) {
            const start = Date.now();
            const wordFinding = new WordFindingTest(board, tiles, request, dictionary, scoreCalculator);
            results = results.concat(wordFinding.findWords());
            totalTime += Date.now() - start;
        }

        console.log(
            ...results.map(
                (p) =>
                    `(${p.startPosition.row}, ${p.startPosition.column}) ${p.orientation} ${p.tilesToPlace
                        .map((l) => `${l.letter}${l.playedLetter ? l.playedLetter : ''}`)
                        .join()} - ${p.score}\n`,
            ),
        );

        console.log(`runned ${iterations} times in ${totalTime} ms (${totalTime / iterations} ms avr.)`);
    });
});
