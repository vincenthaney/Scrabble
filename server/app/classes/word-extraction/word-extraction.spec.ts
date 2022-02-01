import { expect } from 'chai';
import { Board, Square, MultiplierType } from '../board';
import { Tile } from '../tile';
import { WordExtraction } from './word-extraction';


describe('WordExtraction', () => {
    let wordExtraction: WordExtraction;

    beforeEach(async () => {
        wordExtraction = new WordExtraction();
        const boardState = new Board();
    });
    let board: Board;

    /* eslint-disable no-console */

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    /* eslint-disable no-unused-expressions */
    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(board).to.exist;
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

});
