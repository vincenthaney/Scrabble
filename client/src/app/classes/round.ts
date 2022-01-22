export interface Round {
    // player : IPlayer;  // TODO: Check if coupling to player is necessary
    startTime: Date;
    limitTime: Date;
    completedTime: Date | null;
    // actionPlayed: IAction | null;
}
