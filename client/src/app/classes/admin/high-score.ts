import { GameType } from '@app/classes/game-type';

export default interface HighScore {
    score: number;
    names: string[];
    gameType: GameType;
    // constructor(score: number, playerNames: string[]) {
    //     super();
    //     throw new Error('Method not implemented.');
    // }
}

export interface SingleHighScore {
    rank?: number;
    score: number;
    name: string;
    gameType: GameType;
}
