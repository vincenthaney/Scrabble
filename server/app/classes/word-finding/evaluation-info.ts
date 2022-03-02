import { EvaluatedPlacement } from './word-placement';

export default interface EvaluationInfo {
    foundMoves: EvaluatedPlacement[];
    rejectedValidMoves: [number, EvaluatedPlacement][];
    validMoves: EvaluatedPlacement[];
    pointDistributionChance: Map<number, number>;
}
