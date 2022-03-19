import { WordFindingUseCase } from '.';
import Range from '@app/classes/range/range';
export default interface WordFindingRequest {
    useCase: WordFindingUseCase;
    pointRange?: Range;
    pointHistory?: Map<number, number>;
}
