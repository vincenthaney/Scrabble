import Player from '@app/classes/player/player';
import { VIRTUAL_PLAYER_ID_PREFIX } from '@app/constants/virtual-player-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import WordFindingServiceV2 from '@app/services/word-finding/word-finding-v2';
import { Container } from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import Range from '../range/range';

export abstract class AbstractVirtualPlayer extends Player {
    gameId: string;
    pointHistory: Map<number, number>;

    private wordFindingService: WordFindingServiceV2;
    private activeGameService: ActiveGameService;
    private virtualPlayerService: VirtualPlayerService;
    constructor(gameId: string, name: string) {
        super(VIRTUAL_PLAYER_ID_PREFIX + uuidv4(), name);
        this.pointHistory = new Map<number, number>();
        this.gameId = gameId;
        this.wordFindingService = Container.get(WordFindingServiceV2);
        this.activeGameService = Container.get(ActiveGameService);
        this.virtualPlayerService = Container.get(VirtualPlayerService);
    }

    getVirtualPlayerService(): VirtualPlayerService {
        return this.virtualPlayerService;
    }

    getWordFindingService(): WordFindingServiceV2 {
        return this.wordFindingService;
    }

    getActiveGameService(): ActiveGameService {
        return this.activeGameService;
    }

    abstract findPointRange(): Range;

    abstract findAction(): void;

    abstract playTurn(): void;
}
