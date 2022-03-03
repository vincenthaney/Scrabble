import Player from '@app/classes/player/player';
import { PointRange, WordFindingRequest } from '@app/classes/word-finding';
import { WordFindingService } from '@app/services/word-finding/word-finding';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { Router } from 'express';
// import { ActionData } from '@app/classes/communication/action-data';

export abstract class AbstractVirtualPlayer extends Player {
    static wordFindingService: WordFindingService;
    static activeGameService: ActiveGameService;

    gameId: string;
    pointHistoric = new Map<number, number>();
    router: Router;

    constructor(gameId: string, id: string, name: string) {
        super(id, name);
        this.gameId = gameId;
    }

    static getWordFindingService(): WordFindingService {
        return AbstractVirtualPlayer.wordFindingService;
    }

    static getActiveGameService(): ActiveGameService {
        return AbstractVirtualPlayer.activeGameService;
    }

    static injectServices(wordFindingService: WordFindingService): void {
        if (!this.getWordFindingService()) {
            AbstractVirtualPlayer.wordFindingService = wordFindingService;
        }
        if (!this.getActiveGameService()) {
            AbstractVirtualPlayer.activeGameService = this.activeGameService;
        }
    }

    playTurn(): void {
        this.findAction();
    }

    sendPayload() {
        // API call
    }

    generateWordFindingRequest(): WordFindingRequest {
        return {
            pointRange: this.findPointRange(),
            numberOfWordsToFind: 1,
            pointHistoric: this.pointHistoric,
        };
    }

    abstract findPointRange(): PointRange;

    abstract findAction(): void;
}
