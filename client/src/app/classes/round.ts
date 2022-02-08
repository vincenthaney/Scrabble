import { IPlayer } from './player';

export interface Round {
    player: IPlayer;
    startTime: Date;
    limitTime: Date;
    completedTime: Date | null;
    // actionPlayed: IAction | null;
}
