/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { BOARD_SIZE } from '@app/constants/game';
import { expect } from 'chai';
import { Board, Orientation, Position } from '.';
import { SHOULD_HAVE_A_TILE, SHOULD_HAVE_NO_TILE } from './board';
import { POSITION_OUT_OF_BOARD } from './board-errors';

const DEFAULT_TILE_A: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_B: Tile = { letter: 'B', value: 2 };
const DEFAULT_TILE_C: Tile = { letter: 'C', value: 3 };
const DEFAULT_TILE_D: Tile = { letter: 'D', value: 4 };

describe('Board', () => {
    let board: Board;
    let grid: Square[][];

    beforeEach(() => {
        grid = [];
        for (let i = 0; i < BOARD_SIZE.y; i++) {
            grid[i] = [];
            for (let j = 0; j < BOARD_SIZE.x; j++) {
                const square: Square = {
                    tile: null,
                    position: new Position(j, i),
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                };
                grid[i][j] = square;
            }
        }
        board = new Board(grid);
    });

    /* eslint-disable @typescript-eslint/no-unused-expressions */
    /* eslint-disable no-unused-expressions */
    it('should create', () => {
        expect(board).to.exist;
    });

    it('place Tile should place a Tile and return true at the desired Square', () => {
        const targetPosition = new Position(3, 5);
        expect(board.placeTile(DEFAULT_TILE_A, targetPosition)).to.be.true;
        expect(board.grid[targetPosition.row][targetPosition.column].tile === DEFAULT_TILE_A).to.be.true;
    });

    it('place Tile should not place a Tile and return false if it is outside of the board', () => {
        const targetPosition = new Position(3, board.grid.length + 1);
        const result = () => board.placeTile(DEFAULT_TILE_A, targetPosition);
        expect(result).to.throw(POSITION_OUT_OF_BOARD);
    });

    it('place Tile should not place a Tile and return false if it is already occupied', () => {
        const targetPosition = new Position(2, 2);
        board.grid[targetPosition.row][targetPosition.column].tile = DEFAULT_TILE_B;
        expect(board.placeTile(DEFAULT_TILE_A, targetPosition)).to.be.false;
        expect(board.grid[targetPosition.row][targetPosition.column].tile === DEFAULT_TILE_A).to.be.false;
        expect(board.grid[targetPosition.row][targetPosition.column].tile === DEFAULT_TILE_B).to.be.true;
    });

    it('placeWord should place a single letter word and return true', () => {
        const startingSquare = new Position(3, 5);
        expect(board.placeWord([DEFAULT_TILE_A], startingSquare, Orientation.Horizontal)).to.be.true;
        expect(board.grid[startingSquare.row][startingSquare.column].tile === DEFAULT_TILE_A).to.be.true;
    });

    it('placeWord should place a horizontal 2 word letter word and return true', () => {
        const startingSquare = new Position(3, 5);
        expect(board.placeWord([DEFAULT_TILE_C, DEFAULT_TILE_D], startingSquare, Orientation.Horizontal)).to.be.true;
        expect(board.grid[startingSquare.row][startingSquare.column].tile === DEFAULT_TILE_C).to.be.true;
        expect(board.grid[startingSquare.row][startingSquare.column + 1].tile === DEFAULT_TILE_D).to.be.true;
    });

    it('placeWord should place a vertical 3 word letter word and return true', () => {
        const startingSquare = new Position(3, 5);
        expect(board.placeWord([DEFAULT_TILE_C, DEFAULT_TILE_A, DEFAULT_TILE_D], startingSquare, Orientation.Vertical)).to.be.true;
        expect(board.grid[startingSquare.row][startingSquare.column].tile === DEFAULT_TILE_C).to.be.true;
        expect(board.grid[startingSquare.row + 1][startingSquare.column].tile === DEFAULT_TILE_A).to.be.true;
        expect(board.grid[startingSquare.row + 2][startingSquare.column].tile === DEFAULT_TILE_D).to.be.true;
    });

    it('placeWord should not place a letter if it would exceed the board dimensions and return false', () => {
        const startingSquare = new Position(13, 9);
        expect(board.placeWord([DEFAULT_TILE_C, DEFAULT_TILE_A, DEFAULT_TILE_D], startingSquare, Orientation.Horizontal)).to.be.false;
        expect(board.grid[startingSquare.row][startingSquare.column].tile === DEFAULT_TILE_C).to.be.false;
        expect(board.grid[startingSquare.row][startingSquare.column + 1].tile === DEFAULT_TILE_A).to.be.false;
    });

    it('placeWord should place the word and skip over a Square with a tile and return true', () => {
        const startingSquare = new Position(5, 8);
        board.grid[startingSquare.row][startingSquare.column + 1].tile = DEFAULT_TILE_B;
        expect(board.placeWord([DEFAULT_TILE_C, DEFAULT_TILE_A, DEFAULT_TILE_D], startingSquare, Orientation.Horizontal)).to.be.true;
        expect(board.grid[startingSquare.row][startingSquare.column].tile === DEFAULT_TILE_C).to.be.true;
        expect(board.grid[startingSquare.row][startingSquare.column + 1].tile === DEFAULT_TILE_B).to.be.true;
        expect(board.grid[startingSquare.row][startingSquare.column + 2].tile === DEFAULT_TILE_A).to.be.true;
        expect(board.grid[startingSquare.row][startingSquare.column + 3].tile === DEFAULT_TILE_D).to.be.true;
    });

    it('placeWord should not place the word if the starting square is occupied and return false', () => {
        const startingSquare = new Position(5, 8);
        board.grid[startingSquare.row][startingSquare.column].tile = DEFAULT_TILE_B;
        expect(board.placeWord([DEFAULT_TILE_C, DEFAULT_TILE_A, DEFAULT_TILE_D], startingSquare, Orientation.Horizontal)).to.be.false;
        expect(board.grid[startingSquare.row][startingSquare.column].tile === DEFAULT_TILE_C).to.be.false;
        expect(board.grid[startingSquare.row][startingSquare.column].tile === DEFAULT_TILE_B).to.be.true;
        expect(board.grid[startingSquare.row][startingSquare.column + 1].tile === DEFAULT_TILE_A).to.be.false;
    });

    it('verifySquare should throw an EXTRACTION_POSITION_OUT_OF_BOARD when the position is outside the array no matter if a tile is expected', () => {
        const position: Position = new Position(board.grid[0].length + 1, 1);
        const result1 = () => board.verifySquare(position, SHOULD_HAVE_A_TILE);
        expect(result1).to.throw(POSITION_OUT_OF_BOARD);
        const result2 = () => board.verifySquare(position, SHOULD_HAVE_NO_TILE);
        expect(result2).to.throw(POSITION_OUT_OF_BOARD);
    });

    it('verifySquare should return true when the position is valid and there is no tile as expected', () => {
        const position: Position = new Position(7, 1);
        expect(board.verifySquare(position, SHOULD_HAVE_NO_TILE)).to.be.true;
    });

    it('verifySquare should return false when the position is valid but there a tile which was not expected', () => {
        const position: Position = new Position(7, 1);
        board.grid[position.row][position.column].tile = DEFAULT_TILE_A;
        expect(board.verifySquare(position, SHOULD_HAVE_NO_TILE)).to.be.false;
    });

    it('verifySquare should return true when the position is valid and there a tile as expected', () => {
        const position: Position = new Position(7, 1);
        board.grid[position.row][position.column].tile = DEFAULT_TILE_A;
        expect(board.verifySquare(position, SHOULD_HAVE_A_TILE)).to.be.true;
    });

    it('verifySquare should return false when the position is valid but there are no tile when one was expected', () => {
        const position: Position = new Position(7, 1);
        expect(board.verifySquare(position, SHOULD_HAVE_A_TILE)).to.be.false;
    });
});
