import { LetterValue } from '@app/classes/tile';
import { Orientation, Position } from '@app/classes/board';

export interface PlacementWithDistance {
    distance: number;
}
export interface LetterPosition extends PlacementWithDistance {
    letter: LetterValue;
}
export interface PerpendicularLettersPosition extends PlacementWithDistance {
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