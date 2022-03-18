import { Board } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordFindingRequest } from '@app/classes/word-finding';
import { ScoredWordPlacement } from '@app/classes/word-finding/word-placement';
import { Service } from 'typedi';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import WordFinding from '@app/classes/word-finding-v2/word-finding';

@Service()
export default class WordFindingServiceV2 {
    constructor(private readonly dictionaryService: DictionaryService) {}

    findWords(board: Board, tiles: Tile[], request: WordFindingRequest): ScoredWordPlacement[] {
        const dictionary = this.dictionaryService.getDefaultDictionary();
        const wordFinding = new WordFinding(board, tiles, request, dictionary);

        return wordFinding.findWords();
    }
}
