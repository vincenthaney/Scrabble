import { HINT_ACTION_NUMBER_OF_WORDS } from '@app/constants/classes-constants';
import { ScoredWordPlacement } from '@app/classes/word-finding/word-placement';
import WordFinding from './word-finding';

export default class WordFindingHint extends WordFinding {
    handleWordPlacement(wordPlacement: ScoredWordPlacement): void {
        this.wordPlacements.push(wordPlacement);
    }
    isSearchCompleted(): boolean {
        return this.wordPlacements.length >= HINT_ACTION_NUMBER_OF_WORDS;
    }
}
