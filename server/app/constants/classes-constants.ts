interface HelpAction {
    command: string;
    useCase?: string;
    description: string;
}

export const HELP_ACTIONS: HelpAction[] = [
    {
        command: 'placer',
        useCase: '<ligne><colonne>[(h|v)] <lettres>',
        description: 'jouer un mot',
    },
    {
        command: 'echanger',
        useCase: '<lettres>',
        description: 'changer des lettres de son chevalet pour des lettres de la réserve',
    },
    {
        command: 'passer',
        description: 'passer son tour',
    },
    {
        command: 'reserve',
        description: 'affiche les lettres dans la réserve',
    },
];

export const HINT_ACTION_NUMBER_OF_WORDS = 3;

export const START_TILES_AMOUNT = 7;
export const TILE_RESERVE_THRESHOLD = 7;
export const LETTER_DISTRIBUTION_RELATIVE_PATH = '../../../assets/letter-distribution.json';
export const END_GAME_HEADER_MESSAGE = 'Fin de partie - lettres restantes';

export const ORIENTATION_HORIZONTAL_LETTER = 'h';
export const ORIENTATION_VERTICAL_LETTER = 'v';
export const IN_UPPER_CASE = true;

export const NO_WORDS_FOUND = 'Aucun mot trouvé';
export const FOUND_WORDS = '**Mots trouvés**';
