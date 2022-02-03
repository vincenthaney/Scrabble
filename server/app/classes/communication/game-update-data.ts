import { Square } from '@app/classes/board';
import { PlayerData } from './player-data';

export interface GameUpdateData {
    player1?: PlayerData;
    player2?: PlayerData;
    isGameOver?: boolean;
    board?: (Square | undefined)[][];
    round?: unknown;
}
