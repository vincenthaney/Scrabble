import { RejectedMove } from '.';
import { ScoredWordPlacement } from './word-placement';

export default interface PlacementEvaluationResults {
    foundMoves: ScoredWordPlacement[];
    rejectedValidMoves: RejectedMove[];
    validMoves: ScoredWordPlacement[];
    pointDistributionChance: Map<number, number>;
}
