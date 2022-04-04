import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import Range from '@app/classes/range/range';
import { ScoredWordPlacement, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';

export class ExpertVirtualPlayer extends AbstractVirtualPlayer {
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
