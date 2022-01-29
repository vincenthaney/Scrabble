import { Tile } from '@app/classes/tile';
import IScoreMultiplier from './i-score-multiplier';

export type Multiplier = IScoreMultiplier | null;
export default interface Square {
    tile: Tile | null;
    multiplier: Multiplier;
    isMultiplierPlayed: boolean; // TODO: find better name
    isCenter: boolean;
}
