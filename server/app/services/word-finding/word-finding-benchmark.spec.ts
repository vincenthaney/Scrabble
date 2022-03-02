/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-console */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board, Orientation, Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { Container } from 'typedi';
import WordFindingService from './word-finding';
// import { expect } from 'chai';
// import * as chai from 'chai';
// import { stub, useFakeTimers } from 'sinon';
// import { assert } from 'console';
import { WordFindingRequest, WordFindingUsage } from '@app/classes/word-finding';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { StringConversion } from '@app/utils/string-conversion';
import { DICTIONARY_NAME } from '@app/constants/services-constants/words-verification.service.const';

type LetterValues = (LetterValue | ' ')[][];

const BOARD: LetterValues = [
    // 1   2    3    4    5    6    7    8    9   10    11   12   13  14   15
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
    [' ', ' ', ' ', 'J', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 2
    [' ', ' ', ' ', 'U', ' ', ' ', 'J', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 3
    [' ', ' ', ' ', 'M', ' ', 'R', 'O', 'I', 'S', ' ', ' ', ' ', ' ', ' ', ' '], // 4
    [' ', ' ', ' ', 'B', ' ', ' ', 'L', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
    [' ', ' ', 'S', 'O', 'R', 'T', 'I', 'R', 'A', ' ', ' ', ' ', ' ', ' ', ' '], // 6
    [' ', ' ', 'T', ' ', 'U', ' ', ' ', ' ', 'I', ' ', ' ', ' ', ' ', ' ', ' '], // 7
    [' ', ' ', 'Y', ' ', 'E', ' ', ' ', 'A', 'D', 'I', 'E', 'U', ' ', ' ', ' '], // 8
    [' ', ' ', 'L', ' ', ' ', ' ', ' ', 'L', 'E', ' ', 'M', ' ', ' ', ' ', ' '], // 9
    [' ', ' ', 'E', ' ', ' ', 'Z', 'O', 'O', ' ', 'P', 'U', ' ', ' ', ' ', ' '], // 10
    [' ', ' ', 'T', ' ', 'B', 'A', ' ', 'R', ' ', ' ', 'L', ' ', ' ', ' ', ' '], // 11
    [' ', ' ', ' ', 'R', ' ', 'M', ' ', 'S', 'A', 'L', 'S', 'A', ' ', ' ', ' '], // 12
    [' ', ' ', ' ', ' ', ' ', 'B', ' ', ' ', ' ', ' ', 'I', ' ', ' ', ' ', ' '], // 13
    [' ', ' ', ' ', ' ', 'L', 'I', 'R', 'E', ' ', 'M', 'O', 'R', 'S', 'E', ' '], // 14
    [' ', ' ', ' ', ' ', ' ', 'E', ' ', ' ', ' ', ' ', 'N', ' ', ' ', ' ', ' '], // 15
];

// const BOARD: LetterValues = [
//     // 1   2    3    4    5    6    7    8    9   10    11   12   13  14   15
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 2
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 3
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 4
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 7
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 8
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 9
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 10
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 11
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 12
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 13
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 14
//     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 15
// ];

const DEFAULT_TILE_A: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_A_2: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_B: Tile = { letter: 'B', value: 2 };
const DEFAULT_TILE_R: Tile = { letter: 'R', value: 2 };
const DEFAULT_TILE_N: Tile = { letter: 'N', value: 2 };
const DEFAULT_TILE_S: Tile = { letter: 'S', value: 2 };
const DEFAULT_TILE_U: Tile = { letter: 'U', value: 2 };
// const DEFAULT_TILE_C: Tile = { letter: 'C', value: 3 };
// const DEFAULT_TILE_D: Tile = { letter: 'D', value: 4 };
const DEFAULT_TILE_E: Tile = { letter: 'E', value: 5 };
const DEFAULT_TILE_F: Tile = { letter: 'F', value: 6 };
const DEFAULT_TILE_G: Tile = { letter: 'G', value: 7 };
const DEFAULT_TILE_X: Tile = { letter: 'X', value: 7 };
const DEFAULT_TILE_T: Tile = { letter: 'T', value: 7 };
const DEFAULT_TILE_T_2: Tile = { letter: 'T', value: 7 };
const DEFAULT_TILE_I: Tile = { letter: 'I', value: 7 };
// const DEFAULT_TILE_WILD: Tile = { letter: '*', value: 0 };
// const EMPTY_TILE_RACK: Tile[] = [];
// const SINGLE_TILE_TILE_RACK = [DEFAULT_TILE_A];
// const SMALL_TILE_RACK = [DEFAULT_TILE_A, DEFAULT_TILE_B, DEFAULT_TILE_C];
const BIG_TILE_RACK = [DEFAULT_TILE_A, DEFAULT_TILE_B, DEFAULT_TILE_A_2, DEFAULT_TILE_R, DEFAULT_TILE_E, DEFAULT_TILE_S, DEFAULT_TILE_G];
const URNES_TILES_RACK = [DEFAULT_TILE_R, DEFAULT_TILE_N, DEFAULT_TILE_E, DEFAULT_TILE_S, DEFAULT_TILE_A, DEFAULT_TILE_F, DEFAULT_TILE_U];
const BINGO_TILES_RACK = [DEFAULT_TILE_E, DEFAULT_TILE_X, DEFAULT_TILE_T, DEFAULT_TILE_R, DEFAULT_TILE_A, DEFAULT_TILE_I, DEFAULT_TILE_T_2];
// const REPEATING_TILE_RACK = [DEFAULT_TILE_A, DEFAULT_TILE_A_2, DEFAULT_TILE_B, DEFAULT_TILE_C];
const URNE_MOVE = [DEFAULT_TILE_U, DEFAULT_TILE_N, DEFAULT_TILE_E, DEFAULT_TILE_S];
/* eslint-disable @typescript-eslint/no-magic-numbers */
const DEFAULT_HISTORIC = new Map<number, number>([
    [1, 1],
    [2, 2],
    [4, 1],
    [8, 2],
    [12, 1],
    [13, 1],
    [15, 3],
]);
/* eslint-enable @typescript-eslint/no-magic-numbers */

const LOW_SCORE_REQUEST: WordFindingRequest = {
    pointRange: { minimum: 2, maximum: 6 },
    usage: WordFindingUsage.Beginner,
    pointHistoric: DEFAULT_HISTORIC,
};

const MEDIUM_SCORE_REQUEST: WordFindingRequest = {
    pointRange: { minimum: 7, maximum: 12 },
    usage: WordFindingUsage.Beginner,
    pointHistoric: DEFAULT_HISTORIC,
};

const HIGH_SCORE_REQUEST: WordFindingRequest = {
    pointRange: { minimum: 13, maximum: 18 },
    usage: WordFindingUsage.Beginner,
    pointHistoric: DEFAULT_HISTORIC,
};

const BEST_MOVE_REQUEST: WordFindingRequest = {
    usage: WordFindingUsage.Expert,
};

const HINT_REQUEST: WordFindingRequest = {
    usage: WordFindingUsage.Hint,
};

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

const ITERATIONS = 3000000;
describe.only('WordFindingservice', () => {
    let board: Board;
    let service: WordFindingService;

    beforeEach(() => {
        board = boardFromLetterValues(BOARD);
        service = Container.get(WordFindingService);
    });

    afterEach(() => {
        Container.reset();
    });

    describe('findWords performance tests', () => {
        let request: WordFindingRequest;

        it('LOW_SCORE_REQUEST | BIG_TILE_RACK', () => {
            request = { ...LOW_SCORE_REQUEST };
            const result = service.findWords(board, BIG_TILE_RACK, request);
            console.log(`------------result of LOW_SCORE_REQUEST | BIG_TILE_RACK---------- :\n ${result}`);
            if (result) {
                for (const move of result) {
                    console.log(move);
                }
            }
        });

        it('BEST_MOVE_REQUEST | URNES', () => {
            request = { ...BEST_MOVE_REQUEST };
            const result = service.findWords(board, URNES_TILES_RACK, request);
            console.log(`result of BEST_MOVE_REQUEST | BIG_TILE_RACK :\n ${result}`);
            if (result) {
                for (const move of result) {
                    console.log(move);
                }
            }
        });

        it('HINT_REQUEST | URNES', () => {
            request = { ...HINT_REQUEST };
            const result = service.findWords(board, URNES_TILES_RACK, request);
            console.log(`result of HINT_REQUEST | URNES :\n ${result}`);
            if (result) {
                for (const move of result) {
                    console.log(move);
                }
            }
        });

        it('MEDIUM_SCORE_REQUEST | URNES', () => {
            request = { ...MEDIUM_SCORE_REQUEST };
            const result = service.findWords(board, URNES_TILES_RACK, request);
            console.log(`result of MEDIUM_SCORE_REQUEST | URNES :\n ${result}`);
            if (result) {
                for (const move of result) {
                    console.log(move);
                }
            }
        });

        it('HIGH_SCORE_REQUEST | URNES', () => {
            request = { ...HIGH_SCORE_REQUEST };
            service.findWords(board, BINGO_TILES_RACK, request);
        });
        it('EXTRACT ', () => {
            service['wordExtraction'] = new WordExtraction(board);

            let startTime = new Date();
            for (let i = 0; i < ITERATIONS; i++) {
                service['wordExtraction'].extract(URNE_MOVE, new Position(10, 3), Orientation.Vertical);
            }
            const extractResult = service['wordExtraction'].extract(URNE_MOVE, new Position(10, 3), Orientation.Vertical);
            let currentTime = new Date();
            console.log(`EXTRACT LEGAL MOVE Total time : ${currentTime.getTime() - startTime.getTime()} `);

            startTime = currentTime;

            for (let i = 0; i < ITERATIONS; i++) {
                service['wordExtraction'].extract(URNE_MOVE, new Position(3, 2), Orientation.Horizontal);
            }
            currentTime = new Date();
            console.log(`EXTRACT ILLEGAL MOVE Total time : ${currentTime.getTime() - startTime.getTime()} `);

            startTime = currentTime;

            for (let i = 0; i < ITERATIONS; i++) {
                service['wordVerification'].verifyWords(StringConversion.wordToString(extractResult), DICTIONARY_NAME);
            }
            currentTime = new Date();
            console.log(`VERIFY Total time : ${currentTime.getTime() - startTime.getTime()} `);

            startTime = currentTime;

            for (let i = 0; i < ITERATIONS; i++) {
                service['scoreCalculator'].calculatePoints(extractResult) + service['scoreCalculator'].bonusPoints(URNE_MOVE);
            }
            currentTime = new Date();
            console.log(`SCORE CALCULATE Total time : ${currentTime.getTime() - startTime.getTime()} `);
        });
    });
});
