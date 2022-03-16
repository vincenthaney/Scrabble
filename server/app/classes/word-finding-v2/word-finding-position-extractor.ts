import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { LetterValue } from '@app/classes/tile';
import { Square } from '@app/classes/square';

export interface LetterPosition {
    letter: LetterValue;
    distance: number;
}
export interface WFPosition {
    letters: LetterPosition[];
    position: Position;
    orientation: Orientation;
    maxSize: number;
}

const PREVIOUS_EXISTS = -1;

// Note: il serait possible d'ajouter un minSize où minSize serait la distance avec la premiere lettre.
//       Par contre, cela ne compte pas les lettres adjointes des autres lignes. Pour l'instant, cette
//       vérification se fera dans l'extraction.

export default class WordFindingPositionExtractor {
    private navigator: BoardNavigator;
    private board: Board;

    constructor(board: Board) {
        this.board = board;
        this.navigator = new BoardNavigator(board, new Position(0, 0), Orientation.Horizontal);
    }

    extractAllPositions(): WFPosition[] {
        const orientations = [Orientation.Horizontal, Orientation.Vertical];
        let positions: WFPosition[] = [];

        for (const orientation of orientations) {
            this.navigator.position = new Position(0, 0);
            this.navigator.orientation = orientation;

            do {
                const lineExtraction = this.extractLine(this.navigator);
                positions = positions.concat(lineExtraction);
                this.navigator.nextLine();
            } while (this.navigator.isWithinBounds());
        }

        return positions;
    }

    private extractLine(navigator: BoardNavigator): WFPosition[] {
        const lineWPPositions: WFPosition[] = [];

        navigator = navigator.clone();

        const lineLetterPositions = this.getLetterPositionsFromLine(navigator);
        let distance = 0;

        while (navigator.isWithinBounds()) {
            const letterPositions = this.extractPosition(lineLetterPositions, distance);

            if (letterPositions)
                lineWPPositions.push({
                    letters: letterPositions,
                    position: navigator.position.copy(),
                    orientation: navigator.orientation,
                    maxSize: this.getSize(navigator.orientation) - distance,
                });

            navigator.forward();
            distance++;
        }

        return lineWPPositions;
    }

    private extractPosition(lineLetterPositions: LetterPosition[], distance: number): LetterPosition[] | undefined {
        let letterPositions = lineLetterPositions.map((lp) => ({ ...lp, distance: lp.distance - distance }));

        if (letterPositions.some((lp) => lp.distance === PREVIOUS_EXISTS)) return undefined;

        letterPositions = letterPositions.filter((lp) => lp.distance >= 0);

        if (letterPositions.length > 0) return letterPositions;
        else return undefined;
    }

    private getLetterPositionsFromLine(navigator: BoardNavigator): LetterPosition[] {
        const result: LetterPosition[] = [];

        this.getBoardLine(navigator).forEach((square) => {
            if (square.tile)
                result.push({
                    letter: square.tile.letter,
                    distance: this.getDistance(square.position, navigator.orientation),
                });
        });

        return result;
    }

    private getBoardLine(navigator: BoardNavigator): Square[] {
        return navigator.orientation === Orientation.Horizontal
            ? this.board.grid[navigator.row]
            : this.board.grid.map((line) => line[navigator.column]).flat();
    }

    private getDistance(position: Position, orientation: Orientation): number {
        return orientation === Orientation.Horizontal ? position.column : position.row;
    }

    private getSize(orientation: Orientation): number {
        return orientation === Orientation.Horizontal ? this.board.getSize().x : this.board.getSize().y;
    }
}
