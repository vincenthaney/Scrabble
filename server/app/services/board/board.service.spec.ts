/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board, Position } from '@app/classes/board';
import { AbstractScoreMultiplier, LetterScoreMultiplier, Square, WordScoreMultiplier } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';
import { BOARD_CONFIG } from '@app/constants/board-config';
import { BOARD_SIZE } from '@app/constants/game';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import BoardService from './board.service';
import * as BOARD_ERRORS from './board.service.error';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

describe('BoardService', () => {
    let service: BoardService;

    const boardConfigSize: Vec2 = {
        x: BOARD_CONFIG.length,
        y: BOARD_CONFIG[0] ? BOARD_CONFIG[0].length : 0,
    };
    const isBoardDefined = boardConfigSize.x > 0 && boardConfigSize.y > 0;
    const isBoardDefinedTestCases: Map<Position, boolean> = new Map([
        [{ row: -1, col: -1 }, false],
        [{ row: 0, col: 0 }, isBoardDefined],
        [{ row: boardConfigSize.x / 2, col: boardConfigSize.y / 2 }, isBoardDefined],
        [{ row: boardConfigSize.x - 1, col: boardConfigSize.y - 1 }, isBoardDefined],
        [{ row: boardConfigSize.x, col: boardConfigSize.y }, false],
        [{ row: boardConfigSize.x + 1, col: boardConfigSize.y + 1 }, false],
    ]);

    type MapTypes = AbstractScoreMultiplier | null | undefined;
    const boardConfigTestCases: Map<string, MapTypes> = new Map([
        ['x', null],
        ['L2', new LetterScoreMultiplier(2)],
        ['L3', new LetterScoreMultiplier(3)],
        ['W2', new WordScoreMultiplier(2)],
        ['W3', new WordScoreMultiplier(3)],
        ['S', new LetterScoreMultiplier(2)],
        ['?', undefined],
        ['undefined', undefined],
    ]);

    const boardInitializationTestCases: Map<Position, Square | undefined> = new Map([
        [
            { row: 0, col: 0 },
            { tile: null, position: { row: 0, col: 0 }, multiplier: new WordScoreMultiplier(3), wasMultiplierUsed: false, isCenter: false },
        ],
        [
            { row: 1, col: 1 },
            { tile: null, position: { row: 1, col: 1 }, multiplier: new WordScoreMultiplier(2), wasMultiplierUsed: false, isCenter: false },
        ],
        [
            { row: BOARD_SIZE.x - 1, col: 0 },
            {
                tile: null,
                position: { row: BOARD_SIZE.x - 1, col: 0 },
                multiplier: new WordScoreMultiplier(3),
                wasMultiplierUsed: false,
                isCenter: false,
            },
        ],
        [{ row: BOARD_SIZE.x, col: 0 }, undefined],
        [
            { row: 0, col: BOARD_SIZE.y - 1 },
            {
                tile: null,
                position: { row: 0, col: BOARD_SIZE.y - 1 },
                multiplier: new WordScoreMultiplier(3),
                wasMultiplierUsed: false,
                isCenter: false,
            },
        ],
        [{ row: 0, col: BOARD_SIZE.y }, undefined],
        [
            { row: BOARD_SIZE.x - 1, col: BOARD_SIZE.y - 1 },
            {
                tile: null,
                position: { row: BOARD_SIZE.x - 1, col: BOARD_SIZE.y - 1 },
                multiplier: new WordScoreMultiplier(3),
                wasMultiplierUsed: false,
                isCenter: false,
            },
        ],
        [{ row: BOARD_SIZE.x, col: BOARD_SIZE.y }, undefined],
    ]);

    beforeEach(() => {
        service = new BoardService();
    });

    it('should be created', () => {
        expect(service).to.exist;
    });

    isBoardDefinedTestCases.forEach((isDefined: boolean, position: Position) => {
        const textToAdd: string = isDefined ? 'defined' : 'undefined';
        it('Board Configuration at ' + position.row + '/' + position.col + ' should be ' + textToAdd, () => {
            expect(service['isBoardConfigDefined'](position)).to.equal(isDefined);
        });
    });

    boardConfigTestCases.forEach((value: MapTypes, key: string) => {
        it('Parsing Square config for data ' + key + ' should return ' + value, () => {
            if (value === undefined) {
                expect(() => service['parseSquareConfig'](key)).to.throw(BOARD_ERRORS.NO_MULTIPLIER_MAPPED_TO_INPUT(key));
            } else {
                expect(service['parseSquareConfig'](key)).to.deep.equal(value);
            }
        });
    });

    it('Reading board config at undefined position should throw error', () => {
        chai.spy.on(service, 'isBoardConfigDefined', () => false);
        const undefinedPosition: Position = { row: -1, col: -1 };
        expect(() => service['readScoreMultiplierConfig'](undefinedPosition)).to.throw(BOARD_ERRORS.BOARD_CONFIG_UNDEFINED_AT(undefinedPosition));
    });

    it('Reading board config at valid position should return appropriate multiplier', () => {
        chai.spy.on(service, 'isBoardConfigDefined', () => true);
        chai.spy.on(service, 'parseSquareConfig', () => new LetterScoreMultiplier(2));
        expect(service['readScoreMultiplierConfig']({ row: 5, col: 5 })).to.deep.equal(new LetterScoreMultiplier(2));
    });

    it('Initializing board should put center at the center of the board', () => {
        chai.spy.on(service, 'readScoreMultiplierConfig', () => null);
        const board: Board = service.initializeBoard();

        const expectedCenter: Position = { row: 7, col: 7 };
        expect(board.grid[expectedCenter.row][expectedCenter.col].isCenter).to.be.true;
    });

    it('Created board should be the size of size' + BOARD_SIZE.x + 'x' + BOARD_SIZE.y, () => {
        chai.spy.on(service, 'readScoreMultiplierConfig', () => null);
        const board: Board = service.initializeBoard();

        expect(board.grid.length).to.equal(BOARD_SIZE.x);
        expect(board.grid[0].length).to.equal(BOARD_SIZE.y);
    });

    boardInitializationTestCases.forEach((value: Square | undefined, position: Position) => {
        const testText = value ? '' : 'NOT';
        it('Created board should ' + testText + ' have a square at ' + position.row + '/' + position.col, () => {
            if (value) {
                chai.spy.on(service, 'readScoreMultiplierConfig', () => value.multiplier);
            }
            const board: Board = service.initializeBoard();

            if (value) {
                expect(board.grid[position.row][position.col]).to.deep.equal(value);
            } else {
                if (board.grid[position.row]) {
                    expect(board.grid[position.row][position.col]).to.not.exist;
                } else {
                    expect(board.grid[position.row]).to.not.exist;
                }
            }
        });
    });
});
