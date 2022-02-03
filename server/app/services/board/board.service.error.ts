import { Position } from '@app/classes/board';

export const NO_MULTIPLIER_MAPPED_TO_INPUT = (data: string): string => {
    return `There is no multiplier mapped for the board configuration ${data}`;
};
export const BOARD_CONFIG_UNDEFINED_AT = (position: Position): string => {
    return `The board multiplier configuration is undefined at row: ${position.row}, column: ${position.column}`;
};
