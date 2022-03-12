import { PointRange, WordFindingUseCase } from '.';
export default interface WordFindingRequest {
    useCase: WordFindingUseCase;
    pointRange?: PointRange;
    pointHistory?: Map<number, number>;
}
