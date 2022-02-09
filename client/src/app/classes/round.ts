import { AbstractPlayer } from './player';

export interface Round {
    player: AbstractPlayer;
    startTime: Date;
    limitTime: Date;
    completedTime: Date | null;
    // actionPlayed: IAction | null;
}
