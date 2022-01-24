import { BOARD_SIZE } from '@app/classes/game-constants';
import { Square } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';

export class Board {
    static readonly size: Vec2 = { x: BOARD_SIZE.x, y: BOARD_SIZE.y };
    grid: Square[][];
    removePlayedTiles(): void {
        throw new Error('Method not implemented.');
    }
}
