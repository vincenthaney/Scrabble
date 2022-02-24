import Player from '@app/classes/player/player';
import { Action } from '@app/classes/actions';
import { PointRange, WordFindingRequest } from '@app/classes/word-finding';
import WordFindingService from '@app/services/word-finding/word-finding';

export abstract class AbstractVirtualPlayer extends Player {
    private static wordFindingService: WordFindingService;

    pointsHistoric: number[];

    static getWordFindingService(): WordFindingService {
        return AbstractVirtualPlayer.wordFindingService;
    }

    static injectServices(wordFindingService: WordFindingService): void {
        if (!this.getWordFindingService()) {
            AbstractVirtualPlayer.wordFindingService = wordFindingService;
        }
    }

    abstract playTurn(): Action;

    abstract sendPayload(): void;

    abstract generateExchangeAction(): Action;

    abstract generatePassAction(): Action;

    abstract generatePlaceAction(): Action;

    abstract generateWordRequest(): WordFindingRequest;

    abstract findRange(): PointRange;

    abstract findAction(): Action;
}
