import { RejectedMove } from '.';
import { EvaluatedPlacement } from './word-placement';

export default interface PlacementEvaluationResults {
    foundMoves: EvaluatedPlacement[];
    rejectedValidMoves: RejectedMove[];
    validMoves: EvaluatedPlacement[];
    pointDistributionChance: Map<number, number>;
}
