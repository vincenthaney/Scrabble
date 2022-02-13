import { Board, Orientation, Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { SHOULD_HAVE_A_TILE as HAS_TILE } from '@app/classes/board/board';
import { Tile } from '@app/classes/tile';
import { EXTRACTION_SQUARE_ALREADY_FILLED } from './word-extraction-errors';
import Direction from '@app/classes/board/direction';
import { POSITION_OUT_OF_BOARD } from '@app/classes/board/board-errors';

export class WordExtraction {
    constructor(private board: Board) {}

    extract(tilesToPlace: Tile[], startPosition: Position, orientation: Orientation): [Square, Tile][][] {
        const navigator = this.board.navigate(startPosition);

        if (navigator.verify(HAS_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        if (
            !navigator
                .clone()
                .forward(orientation, tilesToPlace.length - 1)
                .isWithinBounds()
        )
            throw new Error(POSITION_OUT_OF_BOARD);

        const wordsCreated: [Square, Tile][][] = new Array();
        const newWord: [Square, Tile][] = [];

        for (let i = 0; i < tilesToPlace.length; ) {
            if (!navigator.isWithinBounds()) throw new Error(POSITION_OUT_OF_BOARD);

            if (navigator.verify(HAS_TILE)) {
                // The square already has a letter, this means that the at the tile at index 'i' must be placed in next square
                // We know that square has a tile because it was checked in the if
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                newWord.push([navigator.square, navigator.square.tile!]);
            } else {
                newWord.push([navigator.square, tilesToPlace[i]]);

                // Add the words created in the opposite Orientation of the move
                const oppositeOrientation = orientation === Orientation.Horizontal ? Orientation.Vertical : Orientation.Horizontal;
                if (navigator.verifyNeighbors(oppositeOrientation, HAS_TILE)) {
                    wordsCreated.push(this.extractWordAroundTile(oppositeOrientation, navigator.position, tilesToPlace[i]));
                }

                i++;
            }

            navigator.forward(orientation);
        }
        navigator.backward(orientation);

        const beforeWord = this.extractWordInDirection(orientation, Direction.Backward, startPosition);
        const afterWord = this.extractWordInDirection(orientation, Direction.Forward, navigator.position);
        const word = [...beforeWord, ...newWord, ...afterWord];

        if (word.length > 1) wordsCreated.push(word);
        return wordsCreated;
    }

    private extractWordAroundTile(orientation: Orientation, position: Position, tile: Tile) {
        const previous = this.extractWordInDirection(orientation, Direction.Backward, position);
        const next = this.extractWordInDirection(orientation, Direction.Forward, position);
        const current = [[this.board.getSquare(position), tile]] as [Square, Tile][];

        return [...previous, ...current, ...next];
    }

    private extractWordInDirection(orientation: Orientation, direction: Direction, position: Position) {
        const navigator = this.board.navigate(position);
        if (navigator.verify(HAS_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const word: [Square, Tile][] = [];

        while (navigator.move(orientation, direction).verify(HAS_TILE)) {
            // We know that square has a tile because it was checked in the while condition
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            word.push([navigator.square, navigator.square.tile!]);
        }

        if (direction === Direction.Backward) word.reverse();

        return word;
    }
}
