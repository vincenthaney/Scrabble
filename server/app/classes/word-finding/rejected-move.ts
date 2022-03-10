import { EvaluatedPlacement } from './word-placement';

export default interface RejectedMove {
    acceptChance: number;
    move: EvaluatedPlacement;
}
