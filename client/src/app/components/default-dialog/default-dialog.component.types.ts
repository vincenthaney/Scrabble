export interface DefaultDialogButtonParameters {
    content: string;
    closeDialog: boolean;
    action?: () => void;
    redirect: string;
}
export interface DefaultDialogParameters {
    title: string;
    content: string;
    buttons: DefaultDialogButtonParameters[];
}
