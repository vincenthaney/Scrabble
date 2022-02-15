import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { PlayerData } from './player-data';
import { RoundData } from './round-data';

export interface GameUpdateData {
    player1?: PlayerData;
    player2?: PlayerData;
    isGameOver?: boolean;
    board?: (Square | undefined)[];
    round?: RoundData;
    tileReserve?: TileReserveData[];
    tileReserveTotal?: number;
}
