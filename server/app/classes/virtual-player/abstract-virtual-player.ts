import Player from '@app/classes/player/player';
import { PointRange, WordFindingRequest } from '@app/classes/word-finding';
import WordFindingService from '@app/services/word-finding/word-finding';
import { Router } from 'express';
// import { ActionData } from '@app/classes/communication/action-data';

export abstract class AbstractVirtualPlayer extends Player {
    private static wordFindingService: WordFindingService;

    gameId: string;
    pointsHistoric: number[];
    router: Router;

    constructor(gameId: string, id: string, name: string) {
        super(id, name);
        this.gameId = gameId;
    }

    static getWordFindingService(): WordFindingService {
        return AbstractVirtualPlayer.wordFindingService;
    }

    static injectServices(wordFindingService: WordFindingService): void {
        if (!this.getWordFindingService()) {
            AbstractVirtualPlayer.wordFindingService = wordFindingService;
        }
    }

    playTurn(): void {
        this.findAction();
        
    }

    generateExchangeAction(): void {
        return undefined;
    }

    generatePassAction(): void {
        return undefined;
    }

    generatePlaceAction(): void {
        return undefined;
    }

    sendPayload() {
        // API call
    }

    abstract generateWordRequest(): WordFindingRequest;

    abstract findRange(): PointRange;

    abstract findAction(): void;
}
