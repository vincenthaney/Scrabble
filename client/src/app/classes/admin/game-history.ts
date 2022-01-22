import { GameType } from '@app/classes/game-type';
import { IStorableModel } from './istorablemodel';

export class GameHistory extends IStorableModel {
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
