import PointRange from './point-range';

export default interface WordFindingQuery {
    pointRange: PointRange;
    numberOfWordsToFind: number;
    pointHistoric: Map<number, number>;
}
