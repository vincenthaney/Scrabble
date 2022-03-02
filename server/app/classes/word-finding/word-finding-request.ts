import { PointRange, WordFindingUsage } from '.';
export default interface WordFindingRequest {
    usage: WordFindingUsage;
    pointRange?: PointRange;
    pointHistoric?: Map<number, number>;
}
