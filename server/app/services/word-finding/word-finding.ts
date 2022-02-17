import { Board } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordFindingQuery, WordPlacement } from '@app/classes/word-finding';
import { Service } from 'typedi';

@Service()
export default class WordFindingService {
    // eslint-disable-next-line no-unused-vars
    findWords(board: Board, tiles: Tile[], query: WordFindingQuery): WordPlacement[] {
        throw new Error('not implemented');
    }
}
