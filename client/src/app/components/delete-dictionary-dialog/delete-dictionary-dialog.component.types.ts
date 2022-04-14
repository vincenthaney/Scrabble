export interface DeleteDictionaryDialogParameters {
    pageTitle: string;
    dictionaryId: string;
    onClose: () => void;
}

export enum DeleteDictionaryComponentStates {
    Ready = 'ready',
    Loading = 'loading',
    Message = 'message',
}
