import { StorableModel } from '@app/classes/admin/storable-model';
import { GameType } from '@app/classes/game-type';

export class GameHistory extends StorableModel {
    startTime: Date;
    gameLength: number;
    player1Name: string;
    player2Name: string;
    player1Score: number;
    player2Score: number;
    gameType: GameType;

    constructor(
        startTime: Date,
        gameLength: number,
        player1Name: string,
        player2Name: string,
        player1Score: number,
        player2Score: number,
        gameType: Game,
    ) {
        super();
        throw new Error('Method not implemented.');
    }
    toJSON(): string {
        return super.toJSON();
    }
}
