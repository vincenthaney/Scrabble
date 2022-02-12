/* eslint-disable @typescript-eslint/naming-convention */
export const createWaitingPageConstants = {
    HOST_WAITING_MESSAGE: "En attente d'un adversaire.",
    OPPONENT_FOUND_MESSAGE: ' a rejoint votre partie.',
    DIALOG_TITLE: 'Attention!',
    DIALOG_CONTENT: " a quitté le salon. Veuillez patientez le temps qu'un autre joueur veuille vous affronter.",
    DIALOG_BUTTON_CONTENT: 'Retourner en attente.',
};

export const joinWaitingPageConstants = {
    DIALOG_BUTTON_CONTENT: 'Retourner à la sélection de parties.',
    DIALOG_REJECT_TITLE: 'Rejeté',
    DIALOG_REJECT_CONTENT: ' vous a rejeté de la partie.',
    DIALOG_CANCEL_TITLE: 'Partie annulée',
    DIALOG_CANCEL_CONTENT: ' a annulé la partie.',
};

export const lobbyPageConstants = {
    DIALOG_BUTTON_CONTENT: 'Retourner à la sélection de parties.',
    DIALOG_FULL_TITLE: 'Partie Remplie',
    DIALOG_FULL_CONTENT: 'La partie est déjà remplie',
    DIALOG_CANCELED_TITLE: 'Partie annulée',
    DIALOG_CANCELED_CONTENT: 'La partie a été annulée',
};
