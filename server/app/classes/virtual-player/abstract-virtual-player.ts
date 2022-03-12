import Player from '@app/classes/player/player';
import { PointRange, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import WordFindingService from '@app/services/word-finding/word-finding';
import { Container } from 'typedi';

export abstract class AbstractVirtualPlayer extends Player {
    gameId: string;
    pointHistory = new Map<number, number>();

    private wordFindingService: WordFindingService;
    private activeGameService: ActiveGameService;
    constructor(gameId: string, id: string, name: string) {
        super(id, name);
        this.gameId = gameId;
        this.wordFindingService = Container.get(WordFindingService);
        this.activeGameService = Container.get(ActiveGameService);
    }

    getWordFindingService(): WordFindingService {
        return this.wordFindingService;
    }

    getActiveGameService(): ActiveGameService {
        return this.activeGameService;
    }

    playTurn(): void {
        this.findAction();
    }

    sendPayload() {
        // API call
        return;
    }

    generateWordFindingRequest(): WordFindingRequest {
        return {
            pointRange: this.findPointRange(),
            useCase: WordFindingUseCase.Beginner,
            pointHistory: this.pointHistory,
        };
    }

    abstract findPointRange(): PointRange;

    abstract findAction(): void;
}
