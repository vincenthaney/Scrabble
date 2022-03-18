import { ScoredWordPlacement } from '@app/classes/word-finding/word-placement';
import WordFinding from './word-finding';

export default class WordFindingBeginner extends WordFinding {
    handleWordPlacement(wordPlacement: ScoredWordPlacement): void {
        if (this.request.pointRange && this.isWithinPointRange(wordPlacement.score, this.request.pointRange)) this.wordPlacements.push(wordPlacement);
    }
    isSearchCompleted(): boolean {
        return this.wordPlacements.length > 0;
    }
}
