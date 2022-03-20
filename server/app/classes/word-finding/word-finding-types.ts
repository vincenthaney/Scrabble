import { LetterValue, Tile } from '@app/classes/tile';
import { Orientation, Position } from '@app/classes/board';
import { DictionaryNode } from '@app/classes/dictionary';
import Range from '@app/classes/range/range';

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

export interface SearcherPerpendicularLetters extends WithDistance {
    before: string;
    after: string;
}

export interface PerpendicularWord extends WithDistance {
    word: string;
    connect: number;
}

export interface DictionarySearchResult {
    word: string;
    perpendicularWords: PerpendicularWord[];
}

export interface WordFindingRequest {
    useCase: WordFindingUseCase;
    pointRange?: Range;
    pointHistory?: Map<number, number>;
}

export enum WordFindingUseCase {
    Expert,
    Beginner,
    Hint,
}

export interface WordPlacement {
    tilesToPlace: Tile[];
    orientation: Orientation;
    startPosition: Position;
}

export interface ScoredWordPlacement extends WordPlacement {
    score: number;
}
