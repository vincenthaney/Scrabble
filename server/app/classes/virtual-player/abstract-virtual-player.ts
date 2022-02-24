import Player from '@app/classes/player/player';
import { Action } from '@app/classes/actions';
import { PointRange, WordFindingRequest } from '@app/classes/word-finding';
import WordFindingService from '@app/services/word-finding/word-finding';

export abstract class AbstractVirtualPlayer extends Player {
    constructor() {
        super();
    }

    pointsHistoric: number[];

    abstract playTurn(): Action;

    abstract sendPayload(): void;

    abstract generateExchangeAction(): Action;

    abstract generatePassAction(): Action;

    abstract generatePlaceAction(): Action;

    abstract generateWordRequest(): WordFindingRequest;

    abstract findRange(): PointRange;

    abstract findAction(): Action;
}
