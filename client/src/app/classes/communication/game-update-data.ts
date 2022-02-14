import { Square } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
import { PlayerData } from './';
import { RoundData } from './round-data';

export default interface GameUpdateData {
    player1?: PlayerData;
    player2?: PlayerData;
    isGameOver?: boolean;
    board?: Square[] | undefined;
    round?: RoundData;
    tileReserve?: { letter: LetterValue; amount: number }[];
    tileReserveTotal?: number;
}
