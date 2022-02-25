import { EXCHANGE_ACTION_THRESHOLD, PASS_ACTION_THRESHOLD } from '@app/constants/virtual-player-constants';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { PointRange } from '@app/classes/word-finding';
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';

export class BeginnerVirtualPlayer extends AbstractVirtualPlayer {
    findRange(): PointRange {
        throw new Error('Method not implemented.');
    }

    findAction(): ActionData {
        const randomAction = Math.random();
        if (randomAction <= PASS_ACTION_THRESHOLD) {
            return ActionPass.createPayload();
        } else if (randomAction <= EXCHANGE_ACTION_THRESHOLD) {
            return ActionExchange.createPayload();
        } else {
            return ActionPlace.createPayload();
        }
    }
}
