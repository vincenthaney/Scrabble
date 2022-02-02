/* eslint-disable max-lines */
import { expect, spy } from 'chai';
import { Board, Orientation, Position } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordExtraction, SHOULD_HAVE_A_TILE, SHOULD_HAVE_NO_TILE } from './word-extraction';
import { EXTRACTION_SQUARE_ALREADY_FILLED, EXTRACTION_POSITION_OUT_OF_BOARD, EXTRACTION_TILES_INVALID } from './word-extraction-errors';
// import { SinonStubbedInstance } from 'sinon';
// import { sandbox } from 'chai-spies';
// import { stub } from 'sinon';

// const sandboxExtract = spy.sandbox(); //WordExtraction, 'extractLeftWord', returns => 'word');
// sandboxExtract.on(WordExtraction, ['extractLeftWord', 'extractRightWord', 'extractUpWord', 'extractDownWord']);
// const boardService: SinonStubbedInstance

// const stub = sinon.stub(Board, 'placeWord').callsFake(() =>);

// const stub_sens = spy(WordExtraction.prototype, 'extractVerticalWord').callsFake(() => {
//     return 'a';
// });
/* eslint-disable no-unused-expressions */

/* eslint-disable @typescript-eslint/no-unused-expressions */



const TILE_J: Tile = { letter: 'J', value: 1 };
const TILE_A: Tile = { letter: 'A', value: 1 };
const TILE_M: Tile = { letter: 'M', value: 1 };
const TILE_B: Tile = { letter: 'B', value: 1 };
const TILE_O: Tile = { letter: 'O', value: 1 };
const TILE_N: Tile = { letter: 'N', value: 1 };
const WORD_JAMBON: Tile[] = [TILE_J, TILE_A, TILE_M, TILE_B, TILE_O, TILE_N];
// const WORD_BON: Tile[] = [TILE_B, TILE_O, TILE_N];

describe('WordExtraction', () => {
    let wordExtraction: WordExtraction;
    let board: Board;
    beforeEach(async () => {
        wordExtraction = new WordExtraction();
        board = new Board();
    });

    it('should create', () => {
        // eslint-disable-next-line no-unused-expressions
        expect(wordExtraction).to.exist;
    });

    it('verifySquare should throw an EXTRACTION_POSITION_OUT_OF_BOARD when the position is outside the array no matter if a tile is expected', () => {
        const position: Position = { row: 1, column: 77 };
        const result1 = () => wordExtraction.verifySquare(board, position, SHOULD_HAVE_A_TILE);
        expect(result1).to.throw(EXTRACTION_POSITION_OUT_OF_BOARD);
        const result2 = () => wordExtraction.verifySquare(board, position, SHOULD_HAVE_NO_TILE);
        expect(result2).to.throw(EXTRACTION_POSITION_OUT_OF_BOARD);
    });

    it('verifySquare should return true when the position is valid and there is no tile as expected', () => {
        const position: Position = { row: 1, column: 7 };
        expect(wordExtraction.verifySquare(board, position, SHOULD_HAVE_NO_TILE)).to.be.true;
    });

    it('verifySquare should return false when the position is valid but there a tile which was not expected', () => {
        const position: Position = { row: 1, column: 7 };
        board.grid[position.row][position.column].tile = TILE_O;
        expect(wordExtraction.verifySquare(board, position, SHOULD_HAVE_NO_TILE)).to.be.false;
    });

    it('verifySquare should return true when the position is valid and there a tile as expected', () => {
        const position: Position = { row: 1, column: 7 };
        board.grid[position.row][position.column].tile = TILE_O;
        expect(wordExtraction.verifySquare(board, position, SHOULD_HAVE_A_TILE)).to.be.true;
    });

    it('verifySquare should return false when the position is valid but there are no tile when one was expected', () => {
        const position: Position = { row: 1, column: 7 };
        expect(wordExtraction.verifySquare(board, position, SHOULD_HAVE_A_TILE)).to.be.false;
    });

    it('extract should throw an EXTRACTION_POSITION_OUT_OF_BOARD when the board grid is an empty array', () => {
        const startPosition: Position = { row: 1, column: 7 };
        const orientation = Orientation.Vertical;
        board.grid = [[]];
        const result = () => wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation);
        expect(result).to.throw(EXTRACTION_POSITION_OUT_OF_BOARD);
    });

    it('extract should throw an EXTRACTION_TILES_INVALID when the TilesToPlace is empty', () => {
        const startPosition = { row: 1, column: 12 };
        const orientation = Orientation.Vertical;
        const result = () => wordExtraction.extract(board, [], startPosition, orientation);
        expect(result).to.throw(EXTRACTION_TILES_INVALID);
    });

    it('extract should throw an EXTRACTION_TILES_INVALID when the TilesToPlace is too big', () => {
        const startPosition = { row: 1, column: 12 };
        const orientation = Orientation.Vertical;
        const BIG_WORD = WORD_JAMBON.concat(WORD_JAMBON).concat(WORD_JAMBON);
        const result = () => wordExtraction.extract(board, BIG_WORD, startPosition, orientation);
        expect(result).to.throw(EXTRACTION_TILES_INVALID);
    });

    it('extract should throw an EXTRACTION_SQUARE_ALREADY_FILLED when the given position is already filled', () => {
        const startPosition = { row: 1, column: 12 };
        board.grid[startPosition.row][startPosition.column].tile = TILE_O;
        const orientation = Orientation.Vertical;
        const result = () => wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation);
        expect(result).to.throw(EXTRACTION_SQUARE_ALREADY_FILLED);
    });

    it('extract should return the word generated by the TilesToPlace when the board is empty', () => {
        const startPosition: Position = { row: 1, column: 7 };
        const orientation = Orientation.Vertical;
        expect(wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation)).to.deep.equal(['JAMBON']);
    });

    it('extract should return the word generated by the TilesToPlace when the board already has a word (Horizontal)', () => {
        const startPosition: Position = { row: 1, column: 7 };
        const orientation = Orientation.Horizontal;
        board.grid[startPosition.row][startPosition.column + 1].tile = TILE_O;
        expect(wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation)).to.deep.equal(['JOAMBON']);
    });

    it('extract should return the word generated by the TilesToPlace when the board already has a word (Vertical)', () => {
        const startPosition: Position = { row: 1, column: 7 };
        const orientation = Orientation.Vertical;
        board.grid[startPosition.row + 3][startPosition.column].tile = TILE_O;
        expect(wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation)).to.deep.equal(['JAMOBON']);
    });

    it('extract should return a the list of words created when it creates many words', () => {
        board.grid[0][0].tile = TILE_M; //   m, b, , n,
        board.grid[0][1].tile = TILE_B; //   @           → ADD JAMBON at @
        board.grid[0][3].tile = TILE_N; //   b
        board.grid[2][0].tile = TILE_B; //   o
        board.grid[3][0].tile = TILE_O;
        const startPosition: Position = { row: 1, column: 0 };
        const orientation = Orientation.Horizontal;
        const expected = ['MJBO', 'BA', 'NB', 'JAMBON'];
        expect(wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation)).to.deep.equal(expected);
    });

    it('extract should return a the list of words created when it creates many words', () => {
        board.grid[0][1].tile = TILE_A; //    A
        board.grid[2][0].tile = TILE_B; //    @      ↓ ADD JAMBON at @
        board.grid[3][0].tile = TILE_O; // B    A
        board.grid[2][2].tile = TILE_A; // O
        const startPosition: Position = { row: 1, column: 1 };
        const orientation = Orientation.Vertical;
        const expected = ['BAA', 'OM', 'AJAMBON'];
        expect(wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation)).to.deep.equal(expected);
    });

    it('extractLeftWord should return the word left of the given empty position (Word middle of board)', () => {
        board.grid[1][4].tile = TILE_B; //
        board.grid[1][5].tile = TILE_O; //    B O N @
        board.grid[1][6].tile = TILE_N; //
        const startPosition = { row: 1, column: 7 };
        expect(wordExtraction.extractLeftWord(board, startPosition)).to.equal('BON');
    });

    it('extractLeftWord should return an empty string if there is nothing left of the given empty position', () => {
        const startPosition = { row: 1, column: 1 };
        expect(wordExtraction.extractLeftWord(board, startPosition)).to.equal('');
    });

    it('extractLeftWord should return an empty string if the given position is on th left edge of the board', () => {
        const startPosition = { row: 1, column: 0 }; // |@
        expect(wordExtraction.extractLeftWord(board, startPosition)).to.equal('');
    });

    it('extractLeftWord should return the word left of the given empty position (Word on edge of board)', () => {
        board.grid[1][0].tile = TILE_B; //    |
        board.grid[1][1].tile = TILE_O; //    |B O N @
        board.grid[1][2].tile = TILE_N; //    |
        const startPosition = { row: 1, column: 3 };
        expect(wordExtraction.extractLeftWord(board, startPosition)).to.equal('BON');
    });

    it('extractLeftWord should throw an error if the given position already has a tile', () => {
        board.grid[1][2].tile = TILE_N;
        const startPosition = { row: 1, column: 2 };
        const result = () => wordExtraction.extractLeftWord(board, startPosition);
        expect(result).to.throw(EXTRACTION_SQUARE_ALREADY_FILLED);
    });

    it('extractLeftWord should throw an error if the given position is out of the board grid', () => {
        const startPosition = { row: -1, column: 100 };
        const result = () => wordExtraction.extractLeftWord(board, startPosition);
        expect(result).to.throw(EXTRACTION_POSITION_OUT_OF_BOARD);
    });

    /// /////////////////////

    it('extractRightWord should return the word right of the given empty position (Word middle of board)', () => {
        board.grid[1][2].tile = TILE_B; //
        board.grid[1][3].tile = TILE_O; //   @ B O N
        board.grid[1][4].tile = TILE_N; //
        const startPosition = { row: 1, column: 1 };
        expect(wordExtraction.extractRightWord(board, startPosition)).to.equal('BON');
    });

    it('extractRightWord should return an empty string if there is nothing right of the given empty position', () => {
        const startPosition = { row: 1, column: 1 };
        expect(wordExtraction.extractRightWord(board, startPosition)).to.equal('');
    });

    it('extractRightWord should return an empty string if the given position is on th right edge of the board', () => {
        const startPosition = { row: 1, column: board.grid[0].length - 1 }; //   @|
        expect(wordExtraction.extractRightWord(board, startPosition)).to.equal('');
    });

    it('extractRightWord should return the word right of the given empty position (Word on edge of board)', () => {
        board.grid[1][board.grid[1].length - 3].tile = TILE_B; //             |
        board.grid[1][board.grid[1].length - 2].tile = TILE_O; //      @ B O N|
        board.grid[1][board.grid[1].length - 1].tile = TILE_N; //             |
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const startPosition = { row: 1, column: board.grid[1].length - 4 };
        expect(wordExtraction.extractRightWord(board, startPosition)).to.equal('BON');
    });

    it('extractRightWord should throw an error if the given position already has a tile', () => {
        board.grid[1][2].tile = TILE_B;
        const result = () => wordExtraction.extractRightWord(board, { row: 1, column: 2 });
        expect(result).to.throw(EXTRACTION_SQUARE_ALREADY_FILLED);
    });

    it('extractRightWord should throw an error if the given position is out of the board grid', () => {
        const startPosition = { row: -1, column: 100 };
        const result = () => wordExtraction.extractRightWord(board, startPosition);
        expect(result).to.throw(EXTRACTION_POSITION_OUT_OF_BOARD);
    });

    it('extractUpWord should return the word up of the given empty position (Word middle of board)', () => {
        board.grid[4][1].tile = TILE_B; //                  B
        board.grid[5][1].tile = TILE_O; //                  O
        board.grid[6][1].tile = TILE_N; //                  N
        const startPosition = { row: 7, column: 1 }; //     @
        expect(wordExtraction.extractUpWord(board, startPosition)).to.equal('BON');
    });

    it('extractUpWord should return an empty string if there is nothing up of the given empty position', () => {
        const startPosition = { row: 1, column: 1 };
        expect(wordExtraction.extractUpWord(board, startPosition)).to.equal('');
    });

    it('extractUpWord should return an empty string if the given position is on the upper edge of the board', () => {
        const startPosition = { row: 0, column: 1 };
        expect(wordExtraction.extractUpWord(board, startPosition)).to.equal('');
    });

    it('extractUpWord should return the word up of the given empty position (Word on edge of board)', () => {
        //                                                 ___
        board.grid[0][1].tile = TILE_B; //                  B
        board.grid[1][1].tile = TILE_O; //                  O
        board.grid[2][1].tile = TILE_N; //                  N
        const startPosition = { row: 3, column: 1 }; //     @
        expect(wordExtraction.extractUpWord(board, startPosition)).to.equal('BON');
    });

    it('extractUpWord should throw an error if the given position already has a tile', () => {
        board.grid[2][1].tile = TILE_B;
        const startPosition = { row: 2, column: 1 };
        const result = () => wordExtraction.extractUpWord(board, startPosition);
        expect(result).to.throw(EXTRACTION_SQUARE_ALREADY_FILLED);
    });

    it('extractUpWord should throw an error if the given position is out of the board grid', () => {
        const startPosition = { row: -1, column: 100 };
        const result = () => wordExtraction.extractUpWord(board, startPosition);
        expect(result).to.throw(EXTRACTION_POSITION_OUT_OF_BOARD);
    });

    it('extractDownWord should return the word down of the given empty position (Word middle of board)', () => {
        const startPosition = { row: 3, column: 1 }; //     @
        board.grid[4][1].tile = TILE_B; //                  B
        board.grid[5][1].tile = TILE_O; //                  O
        board.grid[6][1].tile = TILE_N; //                  N
        expect(wordExtraction.extractDownWord(board, startPosition)).to.equal('BON');
    });

    it('extractDownWord should return an empty string if there is nothing down of the given empty position', () => {
        const startPosition = { row: 1, column: 1 };
        expect(wordExtraction.extractDownWord(board, startPosition)).to.equal('');
    });

    it('extractDownWord should return an empty string if the given position is on the bottom edge of the board', () => {
        const startPosition = { row: board.grid.length - 1, column: 1 };
        expect(wordExtraction.extractDownWord(board, startPosition)).to.equal('');
    });

    it('extractDownWord should return the word down of the given empty position (Word on edge of board)', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const startPosition = { row: board.grid.length - 4, column: 1 }; //     @
        board.grid[board.grid.length - 3][1].tile = TILE_B; //                  B
        board.grid[board.grid.length - 2][1].tile = TILE_O; //                  O
        board.grid[board.grid.length - 1][1].tile = TILE_N; //                  N
        //                                                                     ___
        expect(wordExtraction.extractDownWord(board, startPosition)).to.equal('BON');
    });

    it('extractDownWord should throw an error if the given position already has a tile', () => {
        board.grid[4][1].tile = TILE_O;
        const result = () => wordExtraction.extractDownWord(board, { row: 4, column: 1 });
        expect(result).to.throw(EXTRACTION_SQUARE_ALREADY_FILLED);
    });

    it('extractDownWord should throw an error if the given position is out of the board grid', () => {
        const startPosition = { row: -1, column: 100 };
        const result = () => wordExtraction.extractDownWord(board, startPosition);
        expect(result).to.throw(EXTRACTION_POSITION_OUT_OF_BOARD);
    });

    it('extractVerticalWord should return the following word {UpWord} + {tileToAdd} + {DownWord}', () => {
        board.grid[4][1].tile = TILE_B; //                  B
        board.grid[5][1].tile = TILE_O; //                  O
        board.grid[6][1].tile = TILE_N; //                  N
        const startPosition = { row: 7, column: 1 }; //     @   <-- A
        board.grid[8][1].tile = TILE_J; //                  J
        board.grid[9][1].tile = TILE_A; //                  A
        board.grid[10][1].tile = TILE_M; //                 M
        expect(wordExtraction.extractVerticalWord(board, startPosition, TILE_A)).to.equal('BONAJAM');
    });

    it('extractHorizontalWord should return the following word {LeftWord} + {tileToAdd} + {Right} (Word middle of board)', () => {
        board.grid[1][4].tile = TILE_B;
        board.grid[1][5].tile = TILE_O;
        board.grid[1][6].tile = TILE_N;
        const startPosition = { row: 1, column: 7 }; // BON@JAM
        board.grid[1][8].tile = TILE_J;
        board.grid[1][9].tile = TILE_A;
        board.grid[1][10].tile = TILE_M;
        expect(wordExtraction.extractHorizontalWord(board, startPosition, TILE_A)).to.equal('BONAJAM');
    });
    it('extractHorizontalWord should call extractLeftWord and extractRightWord', () => {
        const rightSpy = spy.on(wordExtraction, 'extractRightWord', () => 'r');
        const leftSpy = spy.on(wordExtraction, 'extractLeftWord', () => 'l');
        const startPosition = { row: 3, column: 3 };
        wordExtraction.extractHorizontalWord(board, startPosition, TILE_A);
        expect(leftSpy).to.have.been.called.once;
        expect(rightSpy).to.have.been.called.once;
    });
    // const verticalSpy = spy.on(WordExtraction, 'extractVerticalWord', () => 'v');
    // const horizontalSpy = spy.on(WordExtraction, 'extractHorizontalWord', () => 'h');
    // it('extractHorizontalWord should call extractLeftWord and extractRightWord', () => {
    //     const rightSpy = spy.on(wordExtraction, 'extractRightWord', () => 'r');
    //     const leftSpy = spy.on(wordExtraction, 'extractLeftWord', () => 'l');
    //     const startPosition = { row: 3, column: 3 };
    //     wordExtraction.extractHorizontalWord(board, startPosition, TILE_A);
    //     expect(leftSpy).to.have.been.called.once;
    //     expect(rightSpy).to.have.been.called.once;
    // });

    // it('extractVerticalWord should call extractUpWord and extractDownWord', () => {
    //     const downSpy = spy.on(wordExtraction, 'extractDownWord', () => 'd');
    //     const upSpy = spy.on(wordExtraction, 'extractUpWord', () => 'u');
    //     const startPosition = { row: 3, column: 3 };

    //     wordExtraction.extractVerticalWord(board, startPosition, TILE_A);
    //     expect(upSpy).to.have.been.called.once;
    //     expect(downSpy).to.have.been.called.once;
    // });
});

//  94

// 109-110

// 137
// 151 121

// 155
