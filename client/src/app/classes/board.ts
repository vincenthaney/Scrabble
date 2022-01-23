import { Square } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';

export class Board {
    static readonly size: Vec2 = { x: 15, y: 15 };
    grid: Square[][];
    removePlayedTiles(): void {
        throw new Error('Method not implemented.');
    }
}
