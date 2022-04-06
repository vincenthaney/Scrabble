import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { AllVowelsObjective } from '@app/classes/objectives/objective-classes/all-vowels';
import { ConsecutivePlaceOrientationObjective } from '@app/classes/objectives/objective-classes/consecutive-place-orientation';
import { PlaceFiveLettersFiveTimesObjective } from '@app/classes/objectives/objective-classes/place-five-letters-five-times';
import { TenLetterWord } from '@app/classes/objectives/objective-classes/ten-letter-word';
import { ThreeWordsPlacement } from '@app/classes/objectives/objective-classes/three-word-placement';
import { TwoTenLetter } from '@app/classes/objectives/objective-classes/two-ten-letter';

export const GENERATE_LIST_OF_ALL_OBJECTIVES = (): AbstractObjective[] => {
    return [
        new ThreeWordsPlacement(),
        new AllVowelsObjective(),
        new TenLetterWord(),
        new ConsecutivePlaceOrientationObjective(),
        new TwoTenLetter(),
        new PlaceFiveLettersFiveTimesObjective(),
    ];
};

export const NUMBER_OF_OBJECTIVES_IN_GAME = 4;

export const OBJECTIVE_COMPLETE_MESSAGE = (name: string, bonusPoints: number) => ` complété l'objectif ${name} pour ${bonusPoints} points`;
