import { GameType } from '@app/classes/game-type';
import { IStorableModel } from './istorablemodel';

export class GameHistory implements IStorableModel {
    startTime: Date;
    gameLength: number;
    player1Name: string;
    player2Name: string;
    player1Score: number;
    player2Score: number;
    gameType: GameType;

    toJSON(): string {
        return '';
    }
}
