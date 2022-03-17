import { Tile } from '@app/classes/tile';

export default interface PlayerData {
    id: string;
    name?: string;
    score?: number;
    tiles?: Tile[];
}
