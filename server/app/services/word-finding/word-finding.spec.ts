/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
// import { Board, Position } from '@app/classes/board';
// import { Square } from '@app/classes/square';
// import ScoreMultiplier, { MultiplierEffect } from '@app/classes/square/score-multiplier';
// import { Vec2 } from '@app/classes/vec2';
// import { BOARD_CONFIG } from '@app/constants/board-config';
// import { BOARD_SIZE } from '@app/constants/game';
// import * as chai from 'chai';
// import * as chaiAsPromised from 'chai-as-promised';
// import * as spies from 'chai-spies';
import { Board } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordFindingQuery } from '@app/classes/word-finding';
import { expect } from 'chai';
import { Container } from 'typedi';
import WordFindingService from './word-finding';
// import { BOARD_CONFIG_UNDEFINED_AT, NO_MULTIPLIER_MAPPED_TO_INPUT } from '@app/constants/services-errors';

// const expect = chai.expect;
// chai.use(spies);
// chai.use(chaiAsPromised);

describe('WordFindingservice', () => {
    let service: WordFindingService;

    beforeEach(() => {
        service = Container.get(WordFindingService);
    });

    it('should be created', () => {
        expect(service).to.exist;
    });

    it('should throw', () => {
        const result = () => service.findWords({} as unknown as Board, [] as unknown as Tile[], {} as unknown as WordFindingQuery);
        expect(result).to.throw();
    });
});

//     boardConfigTestCases.forEach((value: MapTypes, key: string) => {
//         it('Parsing Square config for data ' + key + ' should return ' + value, () => {
//             if (value === undefined) {
//                 expect(() => service['parseSquareConfig'](key)).to.throw(NO_MULTIPLIER_MAPPED_TO_INPUT(key));
//             } else {
//                 expect(service['parseSquareConfig'](key)).to.deep.equal(value);
//             }
//         });
//     });

//     it('Reading board config at undefined position should throw error', () => {
//         chai.spy.on(service, 'isBoardConfigDefined', () => false);
//         const undefinedPosition: Position = new Position(-1, -1);
//         expect(() => service['readScoreMultiplierConfig'](undefinedPosition)).to.throw(BOARD_CONFIG_UNDEFINED_AT(undefinedPosition));
//     });

//     it('Reading board config at valid position should return appropriate multiplier', () => {
//         chai.spy.on(service, 'isBoardConfigDefined', () => true);
//         chai.spy.on(service, 'parseSquareConfig', () => {
//             return { multiplier: 2, multiplierEffect: MultiplierEffect.LETTER };
//         });
//         expect(service['readScoreMultiplierConfig'](new Position(5, 5))).to.deep.equal({
//             multiplier: 2,
//             multiplierEffect: MultiplierEffect.LETTER,
//         });
//     });

//     it('Initializing board should put center at the center of the board', () => {
//         chai.spy.on(service, 'readScoreMultiplierConfig', () => null);
//         const board: Board = service.initializeBoard();

//         const expectedCenter: Position = new Position(7, 7);
//         expect(board.grid[expectedCenter.row][expectedCenter.column].isCenter).to.be.true;
//     });

//     it('Created board should be the size of size' + BOARD_SIZE.x + 'x' + BOARD_SIZE.y, () => {
//         chai.spy.on(service, 'readScoreMultiplierConfig', () => null);
//         const board: Board = service.initializeBoard();

//         expect(board.grid.length).to.equal(BOARD_SIZE.x);
//         expect(board.grid[0].length).to.equal(BOARD_SIZE.y);
//     });

//     boardInitializationTestCases.forEach((value: Square | undefined, position: Position) => {
//         const testText = value ? '' : 'NOT';
//         it('Created board should ' + testText + ' have a square at ' + position.row + '/' + position.column, () => {
//             if (value) {
//                 chai.spy.on(service, 'readScoreMultiplierConfig', () => value.scoreMultiplier);
//             }
//             const board: Board = service.initializeBoard();

//             if (value) {
//                 expect(board.grid[position.row][position.column]).to.deep.equal(value);
//             } else {
//                 if (board.grid[position.row]) {
//                     expect(board.grid[position.row][position.column]).to.not.exist;
//                 } else {
//                     expect(board.grid[position.row]).to.not.exist;
//                 }
//             }
//         });
//     });
// });
