import { Tile } from '@app/classes/tile';
import { MultiplierType } from './square.type';

export default interface Square {
    tile?: Tile;
    multiplier: number;
    multiplierType: MultiplierType;
    played: boolean;
}
