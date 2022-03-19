import { Board } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { Service } from 'typedi';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import AbstractWordFinding from '@app/classes/word-finding/abstract-word-finding/abstract-word-finding';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import WordFindingHint from '@app/classes/word-finding/word-finding-hint/word-finding-hint';
import WordFindingBeginner from '@app/classes/word-finding/word-finding-beginner/word-finding-beginner';
import { Dictionary } from '@app/classes/dictionary';
import { ScoredWordPlacement, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';

@Service()
export default class WordFindingService {
    constructor(private readonly dictionaryService: DictionaryService, private readonly scoreCalculatorService: ScoreCalculatorService) {}

    findWords(board: Board, tiles: Tile[], request: WordFindingRequest): ScoredWordPlacement[] {
        const dictionary = this.dictionaryService.getDefaultDictionary();
        const params: [Board, Tile[], WordFindingRequest, Dictionary, ScoreCalculatorService] = [
            board,
            tiles,
            request,
            dictionary,
            this.scoreCalculatorService,
        ];
        let wordFinding: AbstractWordFinding;

        switch (request.useCase) {
            case WordFindingUseCase.Hint:
                wordFinding = new WordFindingHint(...params);
                break;
            case WordFindingUseCase.Beginner:
                wordFinding = new WordFindingBeginner(...params);
                break;
            case WordFindingUseCase.Expert:
                throw new Error('Not implemented');
        }

        return wordFinding.findWords();
    }
}
