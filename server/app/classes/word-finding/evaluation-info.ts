import { RejectedMove } from '.';
import { EvaluatedPlacement } from './word-placement';

export default interface EvaluationInfo {
    foundMoves: EvaluatedPlacement[];
    rejectedValidMoves: RejectedMove[];
    validMoves: EvaluatedPlacement[];
    pointDistributionChance: Map<number, number>;
}
