export interface DictionaryDialogParameters {
    title: string;
    dictionaryToModifyName: string;
    dictionaryToModifyDescription: string;
    dictionaryId: string;
}

export enum ModifyDictionaryComponentStates {
    Ready = 'ready',
    Loading = 'loading',
    Message = 'message',
}

export enum ModifyDictionaryComponentIcons {
    SuccessIcon = 'check',
    ErrorIcon = 'times',
    NoIcon = '',
}
