export const NO_MULTIPLIER_MAPPED_TO_INPUT = (data: string): string => {
    return `There is no multiplier mapped for the board configuration ${data}`;
};
export const BOARD_CONFIG_UNDEFINED_AT = (row: number, col: number): string => {
    return `The board multiplier configuration is undefined at row: ${row}, column: ${col}`;
};
