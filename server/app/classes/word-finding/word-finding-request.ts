import PointRange from './point-range';

export default interface WordFindingRequest {
    pointRange?: PointRange;
    numberOfWordsToFind: number;
    pointHistoric?: Map<number, number>;
    maximiseScore?: boolean;
}
