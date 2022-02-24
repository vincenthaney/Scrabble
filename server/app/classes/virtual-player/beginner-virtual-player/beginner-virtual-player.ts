import { EXCHANGE_ACTION_THRESHOLD, PASS_ACTION_THRESHOLD } from '@app/constants/virtual-player-constants';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { WordFindingRequest, PointRange } from '@app/classes/word-finding';

export class BeginnerVirtualPlayer extends AbstractVirtualPlayer {
    generateWordRequest(): WordFindingRequest {
        throw new Error('Method not implemented.');
    }
    findRange(): PointRange {
        throw new Error('Method not implemented.');
    }

    findAction(): void {
        const randomAction = Math.random();
        if (randomAction <= PASS_ACTION_THRESHOLD) {
            return this.generatePassAction();
        } else if (randomAction <= EXCHANGE_ACTION_THRESHOLD) {
            return this.generateExchangeAction();
        } else {
            return this.generatePlaceAction();
        }
    }
}
