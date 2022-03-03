import { EXCHANGE_ACTION_THRESHOLD, PASS_ACTION_THRESHOLD } from '@app/constants/virtual-player-constants';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { PointRange } from '@app/classes/word-finding';
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import { Board } from '@app/classes/board';
import { EvaluatedPlacement } from '@app/classes/word-finding/word-placement';

export class BeginnerVirtualPlayer extends AbstractVirtualPlayer {
    findPointRange(): PointRange {
        throw new Error('Method not implemented.');
    }

    findAction(): ActionData {
        const randomAction = Math.random();
        if (randomAction <= PASS_ACTION_THRESHOLD) {
            return ActionPass.getData();
        } else if (randomAction <= EXCHANGE_ACTION_THRESHOLD) {
            return ActionExchange.getData(this.tiles);
        } else {
            // appeler la méthode de Raph et store le résultat dans pointHistoric
            // on a beosin des points pour historic et du mot + position pour le payload
            const evaluatedPlacement = this.createWordFindingPlacement();
            if (evaluatedPlacement) {
                this.pointHistoric[evaluatedPlacement.score]++;
                return ActionPlace.getData(evaluatedPlacement);
            } else {
                return ActionPass.getData();
            }
        }
    }

    getGameBoard(gameId: string, playerId: string): Board {
        return BeginnerVirtualPlayer.activeGameService.getGame(gameId, playerId).board;
    }

    createWordFindingPlacement(): EvaluatedPlacement | undefined {
        return BeginnerVirtualPlayer.wordFindingService
            .findWords(this.getGameBoard(this.gameId, this.id), this.tiles, this.generateWordFindingRequest())
            .pop();
    }
}
