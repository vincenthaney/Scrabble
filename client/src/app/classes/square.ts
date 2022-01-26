import { Tile } from '@app/classes/tile';

export interface Square {
    tile: Tile | null;
    letterMultiplier: number;
    wordMultiplier: number;
    isMultiplierPlayed: boolean; // TODO: find better name
}
