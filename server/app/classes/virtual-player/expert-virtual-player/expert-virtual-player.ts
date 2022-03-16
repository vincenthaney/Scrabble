import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { PointRange } from '@app/classes/word-finding';

export class ExpertVirtualPlayer extends AbstractVirtualPlayer {
    findAction(): void {
        return;
    }
    findPointRange(): PointRange {
        return {
            minimum: 0,
            maximum: 0,
        };
    }
}
