import { SquareView } from '@app/classes/square';
import { Orientation } from '@app/classes/orientation';
import { Position } from '@app/classes/position';
import Direction from './direction';

export class BoardNavigator {
    position: Position;
    orientation: Orientation;
    private squareGrid: SquareView[][];

    constructor(squareGrid: SquareView[][], position: Position, orientation: Orientation) {
        this.squareGrid = squareGrid;
        this.position = { ...position };
        this.orientation = orientation;
    }

    get row() {
        return this.position.row;
    }

    get column() {
        return this.position.column;
    }

    get currentSquareView() {
        return this.squareGrid[this.position.row][this.position.column];
    }

    move(direction: Direction, distance: number = 1): BoardNavigator {
        if (this.orientation === Orientation.Horizontal) {
            this.position.column += direction * distance;
        } else {
            this.position.row += direction * distance;
        }
        return this;
    }

    forward(distance: number = 1): BoardNavigator {
        return this.move(Direction.Forward, distance);
    }

    backward(distance: number = 1): BoardNavigator {
        return this.move(Direction.Backward, distance);
    }

    moveUntil(direction: Direction, predicate: () => boolean): SquareView | undefined {
        do {
            this.move(direction);
        } while (this.isWithinBounds() && !predicate());

        return this.isWithinBounds() ? this.currentSquareView : undefined;
    }

    nextEmpty(direction: Direction, allowNotApplied: boolean): SquareView | undefined {
        return this.moveUntil(direction, () => this.isEmpty(allowNotApplied));
    }

    isWithinBounds(): boolean {
        return (
            this.position.row >= 0 &&
            this.position.column >= 0 &&
            this.position.row < this.squareGrid.length &&
            this.position.column < this.squareGrid[this.position.row].length
        );
    }

    switchOrientation(): BoardNavigator {
        this.orientation = this.orientation === Orientation.Horizontal ? Orientation.Vertical : Orientation.Horizontal;
        return this;
    }

    isEmpty(allowNotApplied: boolean = false): boolean {
        return this.currentSquareView.square.tile === null || (allowNotApplied && this.currentSquareView.applied === false);
    }

    clone(): BoardNavigator {
        return new BoardNavigator(this.squareGrid, this.position, this.orientation);
    }
}
