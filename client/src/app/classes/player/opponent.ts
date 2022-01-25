import IPlayer from './iplayer';

export default abstract class Opponent extends IPlayer {
    /**
     * Indicate to the opponent that it is his turn to play.
     *
     * @Param none
     * @Return void, the event emitter will handle the completion
     */
    abstract startRound(): void;
}
