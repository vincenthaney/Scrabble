import { StorableModel } from '@app/classes/admin';
import { GameType } from '@app/classes/game-type';

export default class GameHistory extends StorableModel {
    startTime: Date;
    gameLength: number;
    player1Name: string;
    player2Name: string;
    player1Score: number;
    player2Score: number;
    gameType: GameType;
}
