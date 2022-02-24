import PointRange from './point-range';

export default interface WordFindingQuery {
    pointRange: PointRange;
    amountOfWords: number;
    pointHistoric: Map<number, number>;
}
