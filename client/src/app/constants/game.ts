import { Player } from '@app/classes/player';
import { Square } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { COLORS } from '@app/constants/colors';

export const LETTER_VALUES: LetterValue[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '*',
];

export const SQUARE_SIZE: Vec2 = { x: 1, y: 1 };
export const MARGIN_COLUMN_SIZE = 1;

export const DEFAULT_SQUARE_COLOR = COLORS.Beige;
export const UNDEFINED_TILE: { letter: '?'; value: number } = { letter: '?', value: -1 };
export const UNDEFINED_GRID_SIZE: Vec2 = { x: -1, y: -1 };
export const UNDEFINED_SQUARE_SIZE: Vec2 = { x: -1, y: -1 };
export const UNDEFINED_SQUARE: Square = {
    tile: null,
    position: { row: -1, column: -1 },
    scoreMultiplier: null,
    wasMultiplierUsed: false,
    isCenter: false,
};

export const VALID_MULTIPLIERS: number[] = [2, 3];

export const RACK_TILE_MIN_FONT_SIZE = 1.1;
export const RACK_TILE_MAX_FONT_SIZE = 1.5;
export const RACK_TILE_DEFAULT_FONT_SIZE = 1.3;
export const RACK_FONT_SIZE_INCREMENT = 0.1;

export const SQUARE_TILE_MIN_FONT_SIZE = 0.82;
export const SQUARE_TILE_MAX_FONT_SIZE = 1.06;
export const SQUARE_TILE_DEFAULT_FONT_SIZE = 0.94;
export const SQUARE_FONT_SIZE_INCREMENT = 0.06;

export const SECONDS_TO_MILLISECONDS = 1000;

export const MIN_COL_NUMBER = 0;
export const MAX_COL_NUMBER = 14;
export const MIN_ROW_NUMBER = 0;
export const MAX_ROW_NUMBER = 14;

export const MAX_LOCATION_COMMAND_LENGTH = 3;
export const MIN_LOCATION_COMMAND_LENGTH = 2;

export const MAX_INPUT_LENGTH = 512;

export const MAX_TILE_PER_PLAYER = 7;

export const DEFAULT_PLAYER = new Player('id', 'name', []);

export const SYSTEM_ID = 'system';
export const SYSTEM_ERROR_ID = 'system-error';

export const ON_YOUR_TURN_ACTIONS = ['placer', 'échanger', 'passer'];

export const EXPECTED_WORD_COUNT_PLACE = 3;
export const EXPECTED_WORD_COUNT_EXCHANGE = 2;
export const EXPECTED_WORD_COUNT_PASS = 1;
// export const EXPECTED_WORD_COUNT_HINT = 1;
export const EXPECTED_WORD_COUNT_HELP = 1;
export const EXPECTED_WORD_COUNT_RESERVE = 1;
