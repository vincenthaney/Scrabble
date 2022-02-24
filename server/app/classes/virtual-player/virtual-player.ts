import Player from '@app/classes/player/player';
import { WordFindingRequest } from '@app/classes/word-finding';

abstract class VirtualPlayer extends Player {
    pointsHistoric: number[];
    playTurn(): void {
        return;
    }

    sendPayload(): void {
        return;
    }

    generateExchangeAction(): void {
        return;
    }

    generatePassAction(): void {
        return;
    }

    generatePlaceAction(): void {
        return;
    }

    generateWordRequest(): void {
        return;
    }

    findRange(): void {
        return;
    }

    findAction(): void {
        return;
    }
}
