import { Tile } from '@app/classes/tile';

export interface PlayerData {
    name: string;
    id: string;
    score: number;
    tiles: Tile[];
}
