import { Board, Orientation, Position } from '.';
import Direction from './direction';

export default class BoardNavigator {
    orientation: Orientation;
    readonly position: Position;

    constructor(private board: Board, position: Position, orientation: Orientation) {
        this.position = position.copy();
        this.orientation = orientation;
    }

    get square() {
        return this.board.getSquare(this.position);
    }

    get row(): number {
        return this.position.row;
    }

    get column(): number {
        return this.position.column;
    }

    verify(shouldBeFilled: boolean): boolean {
        try {
            return this.board.verifySquare(this.position, shouldBeFilled);
        } catch (error) {
            return false;
        }
    }

    verifyNeighbors(orientation: Orientation, shouldBeFilled: boolean) {
        return this.board.verifyNeighbors(this.position, orientation, shouldBeFilled);
    }

    verifyAllNeighbors(shouldBeFilled: boolean) {
        return (
            this.board.verifyNeighbors(this.position, Orientation.Horizontal, shouldBeFilled) ||
            this.board.verifyNeighbors(this.position, Orientation.Vertical, shouldBeFilled)
        );
    }

    move(direction: Direction, distance: number = 1): BoardNavigator {
        this.position.move(this.orientation, direction, distance);
        return this;
    }

    forward(distance: number = 1): BoardNavigator {
        this.position.move(this.orientation, Direction.Forward, distance);
        return this;
    }

    backward(distance: number = 1): BoardNavigator {
        this.position.move(this.orientation, Direction.Backward, distance);
        return this;
    }

    moveUntil(direction: Direction, predicate: () => boolean): number {
        let distanceTravelled = 0;
        while (this.isWithinBounds() && !predicate()) {
            this.move(direction);
            distanceTravelled++;
        }
        return this.isWithinBounds() ? distanceTravelled : Number.POSITIVE_INFINITY;
    }

    switchOrientation(): BoardNavigator {
        this.orientation = this.orientation === Orientation.Horizontal ? Orientation.Vertical : Orientation.Horizontal;
        return this;
    }

    isEmpty(): boolean {
        return this.square.tile === null;
    }

    isWithinBounds(): boolean {
        return this.position.isWithinBounds(this.board.getSize());
    }

    clone(): BoardNavigator {
        return new BoardNavigator(this.board, this.position, this.orientation);
    }
}
