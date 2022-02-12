// export default interface Position {
//     column: number;
//     row: number;
// }

import { Orientation } from '.';
import { Vec2 } from '@app/classes/vec2';
import Direction from './direction';

export default class Position {
    constructor(public column: number, public row: number) {}

    forward(orientation: Orientation, distance: number = 1): Position {
        this.move(orientation, Direction.Forward, distance);
        return this;
    }

    backward(orientation: Orientation, distance: number = 1): Position {
        this.move(orientation, Direction.Backward, distance);
        return this;
    }

    move(orientation: Orientation, direction: Direction, distance: number = 1): Position {
        if (orientation === Orientation.Horizontal) this.column += direction * distance;
        else this.row += direction * distance;
        return this;
    }

    copy(): Position {
        return new Position(this.column, this.row);
    }

    isWithinBounds(size: Vec2) {
        return this.column >= 0 && this.column < size.x && this.row >= 0 && this.row < size.y;
    }
}
