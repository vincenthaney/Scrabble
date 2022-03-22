import {
    EXCHANGE_ACTION_THRESHOLD,
    FINAL_WAIT_TIME,
    HIGH_SCORE_RANGE,
    LOW_SCORE_RANGE,
    LOW_SCORE_THRESHOLD,
    MEDIUM_SCORE_RANGE,
    MEDIUM_SCORE_THRESHOLD,
    MINIMUM_EXCHANGE_WORD_COUNT,
    PASS_ACTION_THRESHOLD,
    PRELIMINARY_WAIT_TIME,
} from '@app/constants/virtual-player-constants';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { PointRange, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import { Board } from '@app/classes/board';
import { ScoredWordPlacement } from '@app/classes/word-finding/word-placement';
import { Delay } from '@app/utils/delay';
import { Tile } from '@app/classes/tile';
import { Random } from '@app/utils/random';

export class BeginnerVirtualPlayer extends AbstractVirtualPlayer {
    async playTurn(): Promise<void> {
        const waitPreliminaryTime = async (): Promise<void> => {
            await Delay.for(PRELIMINARY_WAIT_TIME);
        };
        const waitFinalTime = async (): Promise<void> => {
            await Delay.for(FINAL_WAIT_TIME);
        };

        const play = async (): Promise<[ActionData, void]> => {
            return await Promise.all([this.findAction(), waitPreliminaryTime()]);
        };
        const actionResult: [ActionData, void] | void = await Promise.race([play(), waitFinalTime()]);
        this.getVirtualPlayerService().sendAction(this.gameId, this.id, actionResult ? actionResult[0] : ActionPass.createActionData());
    }

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

    generateWordFindingRequest(): WordFindingRequest {
        return {
            pointRange: this.findPointRange(),
            useCase: WordFindingUseCase.Beginner,
            pointHistory: this.pointHistory,
        };
    }

    async findAction(): Promise<ActionData> {
        const randomAction = Math.random();
        if (randomAction <= PASS_ACTION_THRESHOLD || this.isExchangeImpossible()) {
            return ActionPass.createActionData();
        }
        if (randomAction <= EXCHANGE_ACTION_THRESHOLD) {
            return ActionExchange.createActionData(this.selectRandomTiles());
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

    private isExchangeImpossible(): boolean {
        let total = 0;
        this.getActiveGameService()
            .getGame(this.gameId, this.id)
            .getTilesLeftPerLetter()
            .forEach((value: number) => {
                total += value;
            });
        return total < MINIMUM_EXCHANGE_WORD_COUNT;
    }

    private selectRandomTiles(): Tile[] {
        return Random.getRandomElementsFromArray(this.tiles, Math.ceil(Math.random() * this.tiles.length));
    }
}
