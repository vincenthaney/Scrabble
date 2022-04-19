import { AbstractPlayer } from '@app/classes/player';

export interface Round {
    player: AbstractPlayer;
    startTime: Date;
    limitTime: Date;
    completedTime: Date | null;
}
