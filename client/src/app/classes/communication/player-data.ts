import { Tile } from '@app/classes/tile';
import { ObjectiveData } from './objective-data';

export default interface PlayerData {
    id: string;
    name?: string;
    score?: number;
    tiles?: Tile[];
    objectives?: ObjectiveData[];
}
