import EventEmitter from 'events';
import IPlayer from './iplayer';

export default abstract class Opponent extends IPlayer {
    events: EventEmitter;

    abstract startRound(): void;
}
