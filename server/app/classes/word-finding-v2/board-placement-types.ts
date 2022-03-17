import { LetterValue } from '@app/classes/tile';
import { Orientation, Position } from '@app/classes/board';

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
