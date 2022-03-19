import { HINT_ACTION_NUMBER_OF_WORDS } from '@app/constants/classes-constants';
import { AbstractWordFinding, ScoredWordPlacement } from '@app/classes/word-finding';

export default class WordFindingHint extends AbstractWordFinding {
    handleWordPlacement(wordPlacement: ScoredWordPlacement): void {
        this.wordPlacements.push(wordPlacement);
    }
    isSearchCompleted(): boolean {
        return this.wordPlacements.length >= HINT_ACTION_NUMBER_OF_WORDS;
    }
}
