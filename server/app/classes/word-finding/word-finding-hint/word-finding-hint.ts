import { HINT_ACTION_NUMBER_OF_WORDS, HINT_ACTION_TRIES_NUMBER } from '@app/constants/classes-constants';
import { AbstractWordFinding, ScoredWordPlacement } from '@app/classes/word-finding';

export default class WordFindingHint extends AbstractWordFinding {
    private findingTries = 0;

    handleWordPlacement(wordPlacement: ScoredWordPlacement): void {
        this.findingTries++;
        if (this.wordPlacements.length < HINT_ACTION_NUMBER_OF_WORDS) {
            this.wordPlacements.push(wordPlacement);
        } else {
            for (let i = 0; i < this.wordPlacements.length; ++i) {
                if (this.wordPlacements[i].score < wordPlacement.score) {
                    this.wordPlacements.splice(i, 1, wordPlacement);
                    return;
                }
            }
        }
    }
    isSearchCompleted(): boolean {
        return this.wordPlacements.length >= HINT_ACTION_NUMBER_OF_WORDS && this.findingTries >= HINT_ACTION_TRIES_NUMBER;
    }
}
