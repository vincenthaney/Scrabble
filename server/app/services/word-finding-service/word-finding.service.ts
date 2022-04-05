import { Board } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { Service } from 'typedi';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import AbstractWordFinding from '@app/classes/word-finding/abstract-word-finding/abstract-word-finding';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import WordFindingHint from '@app/classes/word-finding/word-finding-hint/word-finding-hint';
import WordFindingBeginner from '@app/classes/word-finding/word-finding-beginner/word-finding-beginner';
import { ScoredWordPlacement, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';
import WordFindingExpert from '@app/classes/word-finding/word-finding-expert/word-finding-expert';

export type WordFindingParameters = [Board, Tile[], WordFindingRequest];

@Service()
export default class WordFindingService {
    constructor(private readonly dictionaryService: DictionaryService, private readonly scoreCalculatorService: ScoreCalculatorService) {}

    findWords(board: Board, tiles: Tile[], request: WordFindingRequest): ScoredWordPlacement[] {
        return this.getWordFindingInstance(request.useCase, [board, tiles, request]).findWords();
    }

    getWordFindingInstance(useCase: WordFindingUseCase, params: WordFindingParameters): AbstractWordFinding {
        switch (useCase) {
            case WordFindingUseCase.Hint:
                return new WordFindingHint(...params, this.dictionaryService.getDefaultDictionary(), this.scoreCalculatorService);
            case WordFindingUseCase.Beginner:
                return new WordFindingBeginner(...params, this.dictionaryService.getDefaultDictionary(), this.scoreCalculatorService);
            case WordFindingUseCase.Expert:
                return new WordFindingExpert(...params, this.dictionaryService.getDefaultDictionary(), this.scoreCalculatorService);
        }
    }
}
