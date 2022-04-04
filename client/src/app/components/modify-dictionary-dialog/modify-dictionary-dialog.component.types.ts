export interface DictionaryDialogParameters {
    title: string;
    dictionaryToModifyName: string;
    dictionarytoModifyDescription: string;
    dictionaryId: string;
}

export enum ModifyDictionaryComponentStates {
    Ready = 'ready',
    Loading = 'loading',
    Message = 'message',
}

export enum ModifyDictionaryComponentIcons {
    SuccessIcon = 'ready',
    ErrorIcon = 'error',
    NoIcon = '',
}
