export type DisplayDictionariesKeys = 'dictionaryName' | 'dictionaryDescription' | 'dictionaryActions';

export type DisplayDictionariesColumns = {
    [Property in DisplayDictionariesKeys]: string;
};

export type DisplayDictionariesColumnsIteratorItem = { key: DisplayDictionariesKeys; label: string };

export enum DictionariesState {
    Ready = 'ready',
    Loading = 'loading',
    Error = 'error',
}

export interface DictionariesColumns {
    dictionaryName: string;
    dictionaryDescription: string;
    dictionaryActions: string;
}
