import { Tile } from '@app/classes/tile';
import AbstractScoreMultiplier from './abstract-score-multiplier';

export type Multiplier = AbstractScoreMultiplier | null;
export default interface Square {
    tile: Tile | null;
    multiplier: Multiplier;
    wasMultiplierUsed: boolean;
    isCenter: boolean;
}
