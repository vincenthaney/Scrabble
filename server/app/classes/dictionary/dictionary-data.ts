export interface DictionaryData {
    title: string;
    description: string;
    words: string[];
    isDefault?: boolean;
}

export interface DictionaryDataComplete extends DictionaryData {
    id: string;
}
