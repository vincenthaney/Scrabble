export const DICTIONARY_PATH = '../../../assets/dictionaries/dictionnary.json';

export const DICTIONARY_DIRECTORY = '../../../assets/dictionaries';
export const DICTIONARY_INDEX_FILENAME = 'index.json';
export const DEFAULT_DICTIONARY_FILENAME = 'dictionary.json';

export const INVALID_DICTIONARY_NAME = 'Le nom du dictionnaire est invalide';
export const INVALID_DICTIONARY_ID = "L'identificateur (ID) du dictionanaire est invalide";
export const CANNOT_MODIFY_TEST_DICTIONARY = 'Le dictionnaire par défaut ne peut pas être modifié';
export const MAX_DICTIONARY_DESCRIPTION_LENGTH = 80;
export const MAX_DICTIONARY_TITLE_LENGTH = 30;
export const INVALID_DICTIONARY_FORMAT = 'Le dictionnaire ne respecte pas le format attendu';
export const INVALID_DESCRIPTION_FORMAT = 'La description donnée ne respecte pas le format attendu';
export const INVALID_TITLE_FORMAT = 'Le titre donné ne respecte pas le format attendu';

export const NO_DICTIONARY_WITH_NAME = (filename: string) => `Le dictionnaire "${filename}" n'existe pas.`;
export const NO_DICTIONARY_WITH_ID = (id: string) => `Le dictionnaire avec le id "${id}" n'existe pas.`;
export const DEFAULT_DICTIONARY_NOT_FOUND = 'Le fichier dictionnaire par défaut est introuvable.';
export const CANNOT_UPDATE_DEFAULT_DICTIONARY = 'Impossible de modifier le dictionnaire par défaut';
