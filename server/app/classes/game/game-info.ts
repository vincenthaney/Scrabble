import { PlayerData } from '@app/classes/communication/player-data';
import { Round } from '@app/classes/round/round';
import { Square } from '@app/classes/square';

export interface GameInfoData {
    player1: PlayerData;
    player2: PlayerData;
    isGameOver: boolean;
    board: Square[][];
    round: Round;
}
