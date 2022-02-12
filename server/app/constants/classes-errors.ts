/* eslint-disable @typescript-eslint/naming-convention */
export const actionErrors = {
    ERROR_PLAYER_DOESNT_HAVE_TILE: "The player doesn't have tile to play.",
    ERROR_WILDCARD_IN_PLACE_ACTION: "You can't place a wildcard ('*') on the board, it must have the Capital letter of the letter it will represent",
    ERROR_INVALID_WORD: 'The word is invalid',
};

export const boardErrors = {
    POSITION_OUT_OF_BOARD: 'The position is out of the dimensions of the board',
};

export const roundManagerErrors = {
    ERROR_GAME_NOT_STARTED: 'Game not started',
};

export const tileErrors = {
    AMOUNT_MUST_BE_GREATER_THAN_1: 'Amount must be a positive number greater than 1.',
    NOT_ENOUGH_TILES: 'Not enough tiles in reserve.',
    MUST_HAVE_7_TILES_TO_SWAP: 'Reserve must have at least 7 tiles to swap.',
    MUST_SWAP_WITH_TILES_ORIGINALLY_FROM_RESERVE: 'Must swap tiles from tiles originally from reserve.',
    TILE_NOT_IN_RESERVE: 'Tile is not in reserve.',
    TILE_RESERVE_MUST_BE_INITIATED: 'Tile reserve must be initiated',
};

export const wordExtractionErrors = {
    EXTRACTION_SQUARE_ALREADY_FILLED: 'There is already a tile at the given Position',
    EXTRACTION_TILES_INVALID: 'The tiles to extract are not of the correct length',
};
