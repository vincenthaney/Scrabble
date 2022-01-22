import { Tile } from '@app/classes/tile';

export interface Square {
    tile: Tile;
    letterMultiplier: number;
    wordMultiplier: number;
    isMultiplierPlayed: boolean; // TODO: find better name
}
