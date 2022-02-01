import { expect } from 'chai';
import { Board, Square, Orientation, Position } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordExtraction } from './word-extraction';

const TILE_J: Tile = { letter: 'J', value: 1 };
const TILE_A: Tile = { letter: 'A', value: 1 };
const TILE_M: Tile = { letter: 'M', value: 1 };
const TILE_B: Tile = { letter: 'B', value: 1 };
const TILE_O: Tile = { letter: 'O', value: 1 };
const TILE_N: Tile = { letter: 'N', value: 1 };
// const TILE_S: Tile = { letter: 'N', value: 1 };

const WORD_JAMBON: Tile[] = [TILE_J, TILE_A, TILE_M, TILE_B, TILE_O, TILE_N];
// const WORD_NON: Tile[] = [TILE_N, TILE_O, TILE_N];
// const WORD_MA: Tile[] = [TILE_M, TILE_A];
// const WORD_BON: Tile[] = [TILE_B, TILE_O, TILE_N];

const getTilesPlaced = (board: Board, tilesPlaced: Tile[], startPosition: Position, orientation: Orientation): Square[] => {
    const locationWord: Square[] = [];
    for (let i = 0; i < locationWord.length; i++) {
        if (orientation === Orientation.Vertical) locationWord.push(board.grid[startPosition.row + i][startPosition.col]);
        if (orientation === Orientation.Horizontal) locationWord.push(board.grid[startPosition.row][startPosition.col + i]);
    }
    return locationWord;
};

describe('WordExtraction', () => {
    let wordExtraction: WordExtraction;
    let board: Board;
    beforeEach(async () => {
        wordExtraction = new WordExtraction();
        board = new Board();
    });
    // let board: Board;

    /* eslint-disable no-console */

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    /* eslint-disable no-unused-expressions */
    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(wordExtraction).to.exist;
    });

    it('should return an empty array when the board is empty', () => {
        expect(wordExtraction.extract(board, [board.grid[7][7]], Orientation.Vertical)).to.equal([[]]);
    });

    it('should return an empty array when the SquaresPlaced is empty', () => {
        const startPosition = { row: 1, col: 12 };
        const orientation = Orientation.Vertical;
        board.placeWord(WORD_JAMBON, startPosition, orientation);
        expect(wordExtraction.extract(board, [], orientation)).to.equal([[]]);
    });

    it('should return an empty array when the board has no grid', () => {
        board.grid = [[]];
        const startPosition = { row: 1, col: 12 };
        const orientation = Orientation.Vertical;
        board.placeWord(WORD_JAMBON, startPosition, orientation);
        expect(wordExtraction.extract(board, [board.grid[startPosition.row][startPosition.col]], orientation)).to.equal([[]]);
    });

    it('should return an empty array when the a squarePlace has no tile', () => {
        board.grid = [[]];
        const startPosition = { row: 1, col: 12 };
        const orientation = Orientation.Vertical;
        board.placeWord(WORD_JAMBON, startPosition, orientation);
        expect(wordExtraction.extract(board, , orientation)).to.equal([[]]);
    });

    it('should return a single word when the board is empty and you place only 1 word', () => {
        const startPosition = { row: 1, col: 12 };
        const orientation = Orientation.Vertical;
        board.placeWord(WORD_JAMBON, startPosition, orientation);
        const locationJambon = getTilesPlaced(board, WORD_JAMBON, startPosition, orientation);
        expect(wordExtraction.extract(board, locationJambon, orientation)).to.equal(['JAMBON']);
    });

    it('place Tile should place a Tile and return true at the desired Square', () => {
        // const targetPosition = { row: 5, col: 3 };
        // expect(board.placeTile(DEFAULT_TILE_A, targetPosition)).to.be.true;
        // expect(validateTile(board.grid[targetPosition.row][targetPosition.col].tile, DEFAULT_TILE_A)).to.be.true;
    });
});
