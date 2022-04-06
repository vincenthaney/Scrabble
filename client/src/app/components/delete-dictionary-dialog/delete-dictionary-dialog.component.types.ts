export interface DeleteDictionaryDialogParameters {
    title: string;
    dictionaryId: string;
    onClose: () => void;
}

export enum DeleteDictionaryComponentStates {
    Ready = 'ready',
    Loading = 'loading',
    Message = 'message',
}
