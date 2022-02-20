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

    get squareView() {
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

    nextEmpty(): SquareView | undefined {
        const navigator = this.clone();

        do {
            navigator.forward();
        } while (navigator.isWithinBounds() && !navigator.isEmpty());

        return navigator.isWithinBounds() ? navigator.squareView : undefined;
    }

    isWithinBounds(): boolean {
        return this.position.row < this.squareGrid.length && this.position.column < this.squareGrid[this.position.row].length;
    }

    switchOrientation(): BoardNavigator {
        this.orientation = this.orientation === Orientation.Horizontal ? Orientation.Vertical : Orientation.Horizontal;
        return this;
    }

    isEmpty(): boolean {
        return this.squareView.square.tile === null;
    }

    clone(): BoardNavigator {
        return new BoardNavigator(this.squareGrid, this.position, this.orientation);
    }
}
