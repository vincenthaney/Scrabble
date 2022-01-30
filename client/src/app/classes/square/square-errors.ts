import { VALID_MULTIPLIERS } from '@app/constants/game';

export const INVALID_MULTIPLIER = `The score multiplier provided is not one of the valid score multipliers: ${VALID_MULTIPLIERS}`;
export const NO_COLOR_FOR_MULTIPLIER = `The score multiplier does not have a color ' + 
                                        associated because it is not one of the valid multipliers: ${VALID_MULTIPLIERS}`;

export const NO_SQUARE_FOR_SQUARE_VIEW = 'The SquareView property: Square, is undefined';
