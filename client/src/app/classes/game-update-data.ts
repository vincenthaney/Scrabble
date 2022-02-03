import { PlayerData } from './player-data';
import { Square } from './square';

export interface GameUpdateData {
    player1?: PlayerData;
    player2?: PlayerData;
    isGameOver?: boolean;
    board?: (Square | undefined)[][];
    round?: unknown;
}
