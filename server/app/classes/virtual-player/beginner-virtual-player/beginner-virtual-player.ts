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
import { EvaluatedPlacement } from '@app/classes/word-finding/word-placement';

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
            return ActionPass.getData();
        } else if (randomAction <= EXCHANGE_ACTION_THRESHOLD) {
            return ActionExchange.getData(this.tiles);
        } else {
            const evaluatedPlacement = this.createWordFindingPlacement();
            if (evaluatedPlacement) {
                this.updateHistoric(evaluatedPlacement);
                return ActionPlace.getData(evaluatedPlacement);
            } else {
                return ActionPass.getData();
            }
        }
    }

    updateHistoric(evaluatedPlacement: EvaluatedPlacement): void {
        let scoreCount = this.pointHistoric.get(evaluatedPlacement.score);
        if (scoreCount) {
            this.pointHistoric.set(evaluatedPlacement.score, ++scoreCount);
        } else {
            this.pointHistoric.set(evaluatedPlacement.score, 1);
        }
    }

    getGameBoard(gameId: string, playerId: string): Board {
        return this.getActiveGameService().getGame(gameId, playerId).board;
    }

    createWordFindingPlacement(): EvaluatedPlacement | undefined {
        return this.getWordFindingService().findWords(this.getGameBoard(this.gameId, this.id), this.tiles, this.generateWordFindingRequest()).pop();
    }
}
