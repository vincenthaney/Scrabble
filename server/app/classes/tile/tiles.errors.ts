/* eslint-disable @typescript-eslint/naming-convention */
const TileError = {
    AMOUNT_MUST_BE_GREATER_THAN_1: 'Amount must be a positive number greater than 1.',
    NOT_ENOUGH_TILES: 'Not enough tiles in reserve.',
    MUST_HAVE_7_TILES_TO_SWAP: 'Reserve must have at least 7 tiles to swap.',
    MUST_SWAP_WITH_TILES_ORIGINALLY_FROM_RESERVE: 'Must swap tiles from tiles originally from reserve.',
    TILE_NOT_IN_RESERVE: 'Tile is not in reserve.',
    TILE_RESERVE_MUST_BE_INITIATED: 'Tile reserve must be initiated',
};

export default TileError;
