import {
    EXCHANGE_ACTION_THRESHOLD,
    HIGH_SCORE_RANGE,
    LOW_SCORE_RANGE,
    LOW_SCORE_THRESHOLD,
    MEDIUM_SCORE_RANGE,
    MEDIUM_SCORE_THRESHOLD,
    PASS_ACTION_THRESHOLD,
} from '@app/constants/virtual-player-constants';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { PointRange } from '@app/classes/word-finding';
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import { Board } from '@app/classes/board';
import { ScoredWordPlacement } from '@app/classes/word-finding/word-placement';
import { Tile } from '@app/classes/tile';

export class BeginnerVirtualPlayer extends AbstractVirtualPlayer {
    findPointRange(): PointRange {
        const randomPointRange = Math.random();
        if (randomPointRange <= LOW_SCORE_THRESHOLD) {
            return LOW_SCORE_RANGE;
        } else if (randomPointRange <= MEDIUM_SCORE_THRESHOLD) {
            return MEDIUM_SCORE_RANGE;
        } else {
            return HIGH_SCORE_RANGE;
        }
    }

    findAction(): ActionData {
        const randomAction = Math.random();
        if (randomAction <= PASS_ACTION_THRESHOLD) {
            return ActionPass.createActionData();
        }
        if (randomAction <= EXCHANGE_ACTION_THRESHOLD) {
            return ActionExchange.createActionData(this.getRandomTiles());
        }
        const scoredWordPlacement = this.computeWordPlacement();
        if (scoredWordPlacement) {
            this.updateHistory(scoredWordPlacement);
            return ActionPlace.createActionData(scoredWordPlacement);
        }
        return ActionPass.createActionData();
    }

    updateHistory(scoredWordPlacement: ScoredWordPlacement): void {
        const scoreCount = this.pointHistory.get(scoredWordPlacement.score);
        this.pointHistory.set(scoredWordPlacement.score, scoreCount ? scoreCount + 1 : 1);
    }

    getGameBoard(gameId: string, playerId: string): Board {
        return this.getActiveGameService().getGame(gameId, playerId).board;
    }

    computeWordPlacement(): ScoredWordPlacement | undefined {
        return this.getWordFindingService().findWords(this.getGameBoard(this.gameId, this.id), this.tiles, this.generateWordFindingRequest()).pop();
    }

    private getRandomTiles(): Tile[] {
        const keepCount = Math.floor(Math.random() * this.tiles.length);
        const tilesToSwap = this.tiles;
        while (keepCount > 0) {
            tilesToSwap.pop();
        }
        return tilesToSwap;
    }
}
