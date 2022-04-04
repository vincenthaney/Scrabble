import { FINAL_WAIT_TIME, PRELIMINARY_WAIT_TIME } from '@app/constants/virtual-player-constants';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import { Delay } from '@app/utils/delay';
import Range from '@app/classes/range/range';
import { ScoredWordPlacement, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';

export class ExpertVirtualPlayer extends AbstractVirtualPlayer {
    async playTurn(): Promise<void> {
        const waitPreliminaryTime = async (): Promise<void> => {
            await Delay.for(PRELIMINARY_WAIT_TIME);
        };
        const waitFinalTime = async (): Promise<void> => {
            await Delay.for(FINAL_WAIT_TIME);
        };

        const play = async (): Promise<[ActionData, void]> => {
            return Promise.all([this.findAction(), waitPreliminaryTime()]);
        };
        const actionResult: [ActionData, void] | void = await Promise.race([play(), waitFinalTime()]);
        this.getVirtualPlayerService().sendAction(this.gameId, this.id, actionResult ? actionResult[0] : ActionPass.createActionData());
    }

    protected async findAction(): Promise<ActionData> {
        const scoredWordPlacement = this.computeWordPlacement();
        if (scoredWordPlacement) {
            return ActionPlace.createActionData(scoredWordPlacement);
        }
        return this.isExchangePossible() ? ActionExchange.createActionData(this.tiles) : ActionPass.createActionData();
    }

    protected findPointRange(): Range {
        return new Range(0, Number.MAX_SAFE_INTEGER);
    }

    private computeWordPlacement(): ScoredWordPlacement | undefined {
        return this.getWordFindingService().findWords(this.getGameBoard(this.gameId, this.id), this.tiles, this.generateWordFindingRequest()).pop();
    }

    private generateWordFindingRequest(): WordFindingRequest {
        return {
            pointRange: this.findPointRange(),
            useCase: WordFindingUseCase.Expert,
            pointHistory: this.pointHistory,
        };
    }
}
