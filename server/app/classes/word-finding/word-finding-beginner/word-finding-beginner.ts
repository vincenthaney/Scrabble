import { NO_REQUEST_POINT_HISTORY, NO_REQUEST_POINT_RANGE } from '@app/constants/services-errors';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { Board } from '@app/classes/board';
import { Dictionary } from '@app/classes/dictionary';
import { Tile } from '@app/classes/tile';
import { WORD_FINDING_BEGINNER_ACCEPTANCE_THRESHOLD } from '@app/constants/classes-constants';
import { AbstractWordFinding, ScoredWordPlacement, WordFindingRequest } from '@app/classes/word-finding';

export default class WordFindingBeginner extends AbstractWordFinding {
    private placementFoundAcceptance: number = Number.MIN_VALUE;
    private acceptanceProbabilities: Map<number, number>;

    constructor(board: Board, tiles: Tile[], request: WordFindingRequest, dictionary: Dictionary, scoreCalculatorService: ScoreCalculatorService) {
        super(board, tiles, request, dictionary, scoreCalculatorService);
        this.calculateAcceptanceProbabilities();
    }

    protected handleWordPlacement(wordPlacement: ScoredWordPlacement): void {
        if (this.isWithinPointRange(wordPlacement.score)) {
            const acceptanceProbability = this.acceptanceProbabilities.get(wordPlacement.score) ?? 0;
            if (acceptanceProbability > this.placementFoundAcceptance) {
                this.wordPlacements = [wordPlacement];
                this.placementFoundAcceptance = acceptanceProbability;
            }
        }
    }
    protected isSearchCompleted(): boolean {
        return this.wordPlacements.length > 0 && this.placementFoundAcceptance >= WORD_FINDING_BEGINNER_ACCEPTANCE_THRESHOLD;
    }

    private calculateAcceptanceProbabilities(): void {
        if (!this.request.pointRange) throw new Error(NO_REQUEST_POINT_RANGE);
        if (!this.request.pointHistory) throw new Error(NO_REQUEST_POINT_HISTORY);

        const minimumFrequency = this.findScoreMinimumFrequency();
        this.acceptanceProbabilities = new Map<number, number>();

        for (const score of this.request.pointRange) {
            const scoreFrequency = this.request.pointHistory.get(score);
            if (scoreFrequency) {
                this.acceptanceProbabilities.set(score, 1 / (scoreFrequency - minimumFrequency + 1));
            } else {
                this.acceptanceProbabilities.set(score, 1);
            }
        }
    }

    private findScoreMinimumFrequency(): number {
        if (!this.request.pointRange) throw new Error(NO_REQUEST_POINT_RANGE);
        if (!this.request.pointHistory) throw new Error(NO_REQUEST_POINT_HISTORY);

        let minimumFrequency = Number.MAX_VALUE;

        for (const score of this.request.pointRange) {
            const scoreFrequency = this.request.pointHistory.get(score) ?? 0;
            if (scoreFrequency < minimumFrequency) minimumFrequency = scoreFrequency;
        }

        return minimumFrequency;
    }
}
