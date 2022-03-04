import { Board } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordFindingRequest, WordPlacement } from '@app/classes/word-finding';
import { Service } from 'typedi';
// import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
// import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
// import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';

@Service()
export default class WordFindingService {
    // constructor(
    //     private wordExtraction: WordExtraction,
    //     private wordVerification: WordsVerificationService,
    //     private scoreCalculator: ScoreCalculatorService,
    // ) {}

    // eslint-disable-next-line no-unused-vars
    findWords(board: Board, tiles: Tile[], query: WordFindingRequest): WordPlacement[] {
        throw new Error('not implemented');
    }
}
