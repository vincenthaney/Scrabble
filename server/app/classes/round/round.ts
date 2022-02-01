import Player from '@app/classes/player/player';

export default interface Round {
    player: Player;
    startTime: Date;
    limitTime: Date;
    completedTime: Date | null;
    // actionPlayed: IAction | null;
}
