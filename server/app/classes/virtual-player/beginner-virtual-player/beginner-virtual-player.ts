import { Action } from '@app/classes/actions';
import { PointRange, WordFindingRequest } from '@app/classes/word-finding';
import { EXCHANGE_ACTION_THRESHOLD, PASS_ACTION_THRESHOLD } from '@app/constants/virtual-player-constants';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import WordFindingService from '@app/services/word-finding/word-finding';

export class BeginnerVirtualPlayer extends AbstractVirtualPlayer {
    getWordFindingService(): WordFindingService {
        return Game.boardService;
    }

    injectServices(boardService: WordFindingService): void {
        if (!this.getWordFindingService()) {
            Game.boardService = boardService;
        }
    }

    playTurn(): Action {
        const randomAction = Math.random();
        if (randomAction <= PASS_ACTION_THRESHOLD) {
            return this.generatePassAction();
        } else if (randomAction <= EXCHANGE_ACTION_THRESHOLD) {
            return this.generateExchangeAction();
        } else {
            return this.generatePlaceAction();
        }
    }

    sendPayload(): void;

    generateExchangeAction(): Action {}

    generatePassAction(): Action;

    generatePlaceAction(): Action;

    generateWordRequest(): WordFindingRequest;

    findRange(): PointRange;

    findAction(): Action;
}
