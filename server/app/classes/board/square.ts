import { Tile } from '@app/classes/tile';
import { MultiplierType } from './multiplier-type';

export default interface Square {
    tile?: Tile;
    multiplier: number;
    multiplierType: MultiplierType;
    played: boolean;
    row: number;
    column: number;
}
