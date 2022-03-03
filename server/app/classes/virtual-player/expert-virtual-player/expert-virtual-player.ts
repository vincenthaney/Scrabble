import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { WordFindingRequest, PointRange } from '@app/classes/word-finding';

export class ExpertVirtualPlayer extends AbstractVirtualPlayer {
    generateWordRequest(): WordFindingRequest {
        throw new Error('Method not implemented.');
    }
    findPointRange(): PointRange {
        throw new Error('Method not implemented.');
    }

    findAction(): void {
        throw new Error('Method not implemented.');
    }
}
