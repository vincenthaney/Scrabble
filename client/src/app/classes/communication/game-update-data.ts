import { Round } from '@app/classes/round';
import { Square } from '@app/classes/square';
import { PlayerData } from './player-data';

export interface GameUpdateData {
    player1?: PlayerData;
    player2?: PlayerData;
    isGameOver?: boolean;
    board?: Square[] | undefined;
    round?: Round;
}
