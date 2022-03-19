import Range from '@app/classes/range/range';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';

export class ExpertVirtualPlayer extends AbstractVirtualPlayer {
    playTurn(): void {
        return;
    }
    findAction(): void {
        return;
    }
    findPointRange(): Range {
        return new Range(0, 0);
    }
}
