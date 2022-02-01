import { expect } from 'chai';
import { Tile } from '@app/classes/tile';
import Board from './board';
import { Orientation } from '.';

const DEFAULT_TILE_A: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_B: Tile = { letter: 'B', value: 2 };
const DEFAULT_TILE_C: Tile = { letter: 'C', value: 3 };
const DEFAULT_TILE_D: Tile = { letter: 'D', value: 4 };

const validateTile = (tileToValidate: Tile | undefined, tileExpected: Tile | undefined): boolean => {
    if (!tileToValidate || !tileExpected) return false;
    return tileToValidate.letter === tileExpected.letter && tileToValidate.value === tileExpected.value;
};

describe('Board', () => {
    let board: Board;

    beforeEach(() => {
        board = new Board();
    });
    /* eslint-disable no-console */

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    /* eslint-disable no-unused-expressions */
    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(board).to.exist;
    });

    // TODO: CHANGER POUR CONSTANTE THOM
    it('should create a board with 15 columns', () => {
        expect(board.grid.length).to.equal(15);
    });

    it('should create a board with 15 rows', () => {
        expect(board.grid[0].length).to.equal(15);
    });

    // it('should create a board with all empty squares', () => {
    //     for (let i = 0; i < 15; i++) {
    //         for (let j = 0; j < 15; i++) {
    //             console.log(board.grid[i][j].tile);
    //             expect(board.grid[i][j].tile).to.be.undefined;
    //         }
    //     }
    // });

    it('place Tile should place a Tile and return true at the desired Square', () => {
        const targetPosition = { row: 5, col: 3 };
        expect(board.placeTile(DEFAULT_TILE_A, targetPosition)).to.be.true;
        expect(validateTile(board.grid[targetPosition.row][targetPosition.col].tile, DEFAULT_TILE_A)).to.be.true;
    });

    it('place Tile should not place a Tile and return false if it is outside of the board', () => {
        const targetPosition = { row: 16, col: 3 };
        expect(board.placeTile(DEFAULT_TILE_A, targetPosition)).to.be.false;
    });

    it('place Tile should not place a Tile and return false if it is outside of the board', () => {
        const targetPosition = { row: 6, col: 31 };
        board.placeTile(DEFAULT_TILE_A, targetPosition);
    });

    it('place Tile should not place a Tile and return false if it is already occupied', () => {
        const targetPosition = { row: 2, col: 2 };
        board.grid[targetPosition.row][targetPosition.col].tile = DEFAULT_TILE_B;
        expect(board.placeTile(DEFAULT_TILE_A, targetPosition)).to.be.false;
        expect(validateTile(board.grid[targetPosition.row][targetPosition.col].tile, DEFAULT_TILE_A)).to.be.false;
        expect(validateTile(board.grid[targetPosition.row][targetPosition.col].tile, DEFAULT_TILE_B)).to.be.true;
    });

    it('placeWord should place a single letter word and return true', () => {
        const startingSquare = { row: 5, col: 3 };
        console.log(board.placeWord([DEFAULT_TILE_A], startingSquare, Orientation.Horizontal));
        console.log(board.grid[startingSquare.row][startingSquare.col].tile);
        expect(true).to.be.true;
        console.log(board.grid[startingSquare.row][startingSquare.col]);
        console.log(validateTile(board.grid[startingSquare.row][startingSquare.col].tile, DEFAULT_TILE_A));
        expect(validateTile(board.grid[startingSquare.row][startingSquare.col].tile, DEFAULT_TILE_A)).to.be.true;
    });

    it('placeWord should place a horizontal 2 word letter word and return true', () => {
        const startingSquare = { row: 5, col: 3 };
        expect(board.placeWord([DEFAULT_TILE_C, DEFAULT_TILE_D], startingSquare, Orientation.Horizontal)).to.be.true;
        expect(validateTile(board.grid[startingSquare.row][startingSquare.col].tile, DEFAULT_TILE_C)).to.be.true;
        expect(validateTile(board.grid[startingSquare.row + 1][startingSquare.col].tile, DEFAULT_TILE_D)).to.be.true;
    });

    it('placeWord should place a vertical 3 word letter word and return true', () => {
        const startingSquare = { row: 5, col: 3 };
        expect(board.placeWord([DEFAULT_TILE_C, DEFAULT_TILE_A, DEFAULT_TILE_D], startingSquare, Orientation.Vertical)).to.be.true;
        expect(validateTile(board.grid[startingSquare.row][startingSquare.col].tile, DEFAULT_TILE_C)).to.be.true;
        expect(validateTile(board.grid[startingSquare.row][startingSquare.col + 1].tile, DEFAULT_TILE_A)).to.be.true;
        expect(validateTile(board.grid[startingSquare.row][startingSquare.col + 2].tile, DEFAULT_TILE_D)).to.be.true;
    });

    it('placeWord should not place a letter if it would exceed the board dimensions and return false', () => {
        const startingSquare = { row: 13, col: 3 };
        expect(board.placeWord([DEFAULT_TILE_C, DEFAULT_TILE_A, DEFAULT_TILE_D], startingSquare, Orientation.Vertical)).to.be.false;
        expect(validateTile(board.grid[startingSquare.row][startingSquare.col].tile, DEFAULT_TILE_C)).to.be.false;
        expect(validateTile(board.grid[startingSquare.row][startingSquare.col + 1].tile, DEFAULT_TILE_A)).to.be.false;
        expect(validateTile(board.grid[startingSquare.row][startingSquare.col + 2].tile, DEFAULT_TILE_D)).to.be.false;
    });

    // it('placeWord should not place a letter if it would exceed the board dimensions and return false', () => {
    //     const startingSquare = { row: 13, col: 3 };
    //     // board.grid[targetPosition.row][targetPosition.col].tile = DEFAULT_TILE_B;

    //     expect(board.placeWord([DEFAULT_TILE_C, DEFAULT_TILE_A, DEFAULT_TILE_D], startingSquare, Orientation.Vertical)).to.be.false;
    //     expect(validateTile(board.grid[startingSquare.row][startingSquare.col].tile, DEFAULT_TILE_C)).to.be.false;
    //     expect(validateTile(board.grid[startingSquare.row][startingSquare.col + 1].tile, DEFAULT_TILE_A)).to.be.false;
    //     expect(validateTile(board.grid[startingSquare.row][startingSquare.col + 2].tile, DEFAULT_TILE_D)).to.be.false;
    // });
});
