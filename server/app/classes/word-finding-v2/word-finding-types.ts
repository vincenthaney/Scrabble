import { LetterValue } from '@app/classes/tile';
import { Orientation, Position } from '@app/classes/board';
import { DictionaryNode } from '@app/classes/dictionary';

export interface WithDistance {
    distance: number;
}
export interface LetterPosition extends WithDistance {
    letter: LetterValue;
}
export interface PerpendicularLettersPosition extends WithDistance {
    before: LetterValue[];
    after: LetterValue[];
}
export interface LinePlacements {
    letters: LetterPosition[];
    perpendicularLetters: PerpendicularLettersPosition[];
}
export interface BoardPlacement {
    letters: LetterPosition[];
    perpendicularLetters: PerpendicularLettersPosition[];
    position: Position;
    orientation: Orientation;
    maxSize: number;
    minSize: number;
}

export interface DictionarySearcherStackItem {
    node: DictionaryNode;
    playerLetters: string[];
}

export interface SearcherPerpendicularLetters {
    before: string;
    after: string;
    distance: number;
}

export interface PerpendicularWord {
    word: string;
    distance: number;
}

export interface DictionarySearchResult {
    word: string;
    perpendicularWords: PerpendicularWord[];
}
