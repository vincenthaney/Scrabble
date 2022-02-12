import { Round } from '@app/classes/round';
import { Square } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
import { PlayerData } from './';

export default interface GameUpdateData {
    player1?: PlayerData;
    player2?: PlayerData;
    isGameOver?: boolean;
    board?: Square[] | undefined;
    round?: Round;
    tileReserve?: { letter: LetterValue; amount: number }[];
    tileReserveTotal?: number;
}
