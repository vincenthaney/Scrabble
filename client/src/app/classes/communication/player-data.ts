import { Tile } from '@app/classes/tile';

export default interface PlayerData {
    name?: string;
    id?: string;
    score?: number;
    tiles?: Tile[];
}
