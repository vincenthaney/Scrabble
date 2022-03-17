import Player from '@app/classes/player/player';
import { PointRange, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';
import { VIRTUAL_PLAYER_ID_PREFIX } from '@app/constants/virtual-player-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import WordFindingService from '@app/services/word-finding/word-finding';
import { Container } from 'typedi';
import { v4 as uuidv4 } from 'uuid';

export abstract class AbstractVirtualPlayer extends Player {
    gameId: string;
    pointHistory: Map<number, number>;

    private wordFindingService: WordFindingService;
    private activeGameService: ActiveGameService;
    constructor(gameId: string, name: string) {
        super(VIRTUAL_PLAYER_ID_PREFIX + uuidv4(), name);
        this.pointHistory = new Map<number, number>();
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
