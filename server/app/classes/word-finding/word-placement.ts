import { Orientation, Position } from '@app/classes/board';
import { Tile } from '@app/classes/tile';

export default interface WordPlacement {
    tilesToPlace: Tile[];
    orientation: Orientation;
    startPosition: Position;
}

export interface EvaluatedPlacement extends WordPlacement {
    score: number;
}
