import { ScoredWordPlacement } from './word-placement';

export default interface RejectedMove {
    acceptChance: number;
    move: ScoredWordPlacement;
}
