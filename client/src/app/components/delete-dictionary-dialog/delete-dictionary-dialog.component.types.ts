export interface DeleteDictionaryDialogParameters {
    title: string;
    dictionaryId: string;
}

export enum DeleteDictionaryComponentStates {
    Ready = 'ready',
    Loading = 'loading',
    Message = 'message',
}
