import { Dictionary } from '.';

export interface DictionaryDataBasic {
    title: string;
    description: string;
    words: string[];
}

export interface DictionaryData extends DictionaryDataBasic {
    isDefault?: boolean;
}

export interface DictionaryDataComplete extends DictionaryData {
    id: string;
}

export interface DictionaryUsage {
    dictionary: Dictionary;
    numberOfActiveGames: number;
}

export interface DictionarySummary {
    title: string;
    description: string;
    id: string;
    isDefault?: boolean;
}

export interface DictionaryUpdateInfo {
    id: string;
    title?: string;
    description?: string;
}
