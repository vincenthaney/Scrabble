import { Dictionary } from '.';

export interface DictionaryData {
    title: string;
    description: string;
    words: string[];
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
