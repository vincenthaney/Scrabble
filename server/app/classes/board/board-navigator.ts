import { Board, Orientation, Position } from '.';
import Direction from './direction';

export default class BoardNavigator {
    readonly position: Position;

    constructor(private board: Board, position: Position) {
        this.position = position.copy();
    }

    get square() {
        return this.board.getSquare(this.position);
    }

    verify(shouldBeFilled: boolean): boolean {
        try {
            return this.board.verifySquare(this.position, shouldBeFilled);
        } catch (e) {
            return false;
        }
    }

    verifyNeighbors(orientation: Orientation, shouldBeFilled: boolean) {
        return this.board.verifyNeighbors(this.position, orientation, shouldBeFilled);
    }

    move(orientation: Orientation, direction: Direction, distance: number = 1): BoardNavigator {
        this.position.move(orientation, direction, distance);
        return this;
    }

    forward(orientation: Orientation, distance: number = 1): BoardNavigator {
        this.position.move(orientation, Direction.Forward, distance);
        return this;
    }

    backward(orientation: Orientation, distance: number = 1): BoardNavigator {
        this.position.move(orientation, Direction.Backward, distance);
        return this;
    }

    isWithinBounds(): boolean {
        return this.position.isWithinBounds(this.board.getSize());
    }

    detach(): BoardNavigator {
        return new BoardNavigator(this.board, this.position);
    }
}
