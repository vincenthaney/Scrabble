import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import Range from '@app/classes/range/range';
import { WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';

export class ExpertVirtualPlayer extends AbstractVirtualPlayer {
    protected async findAction(): Promise<ActionData> {
        const scoredWordPlacement = this.computeWordPlacement();
        return scoredWordPlacement ? ActionPlace.createActionData(scoredWordPlacement) : this.alternativeMove();
    }

    protected findPointRange(): Range {
        return new Range(0, Number.MAX_SAFE_INTEGER);
    }

    protected alternativeMove(): ActionData {
        if (this.wordFindingInstance) {
            const bestMove = this.wordFindingInstance.wordPlacements.pop();
            if (bestMove) return ActionPlace.createActionData(bestMove);
        }
        return this.isExchangePossible() ? ActionExchange.createActionData(this.tiles) : ActionPass.createActionData();
    }

    // private computeWordPlacement(): ScoredWordPlacement | undefined {
    //     const request = this.generateWordFindingRequest();
    //     this.wordFindingInstance = this.getWordFindingService().getWordFindingInstance(request.useCase, [
    //         this.getGameBoard(this.gameId, this.id),
    //         this.tiles,
    //         request,
    //     ]);
    //     return this.wordFindingInstance.findWords().pop();
    // }

    protected generateWordFindingRequest(): WordFindingRequest {
        return {
            pointRange: this.findPointRange(),
            useCase: WordFindingUseCase.Expert,
            pointHistory: this.pointHistory,
        };
    }
}
