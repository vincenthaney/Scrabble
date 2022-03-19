import { Message } from '@app/classes/communication/message';
import { SYSTEM_ID } from './game';

export enum CommandExceptionMessages {
    BadSyntax = 'La commande ne respecte pas la syntaxe requise.',
    PlaceBadSyntax = 'La commande placer doit suivre le format _!placer ‹position› ‹lettres›_',
    ExchangeBadSyntax = 'La commande échanger doit suivre le format _!échanger ‹lettres›_',
    PassBadSyntax = 'La commande passer doit suivre le format _!passer_',
    InvalidEntry = "Cette commande n'est pas reconnue. Entrez !aide pour connaitre les commandes valides",
    ImpossibleCommand = 'Cette commande est impossible à réaliser.',
    DontHaveTiles = "Vous n'avez pas les tuiles requises.",
    PositionFormat = 'La position doit être de format _‹a-o›‹1-15›‹h/v›_.',
    NotYourTurn = "Ce n'est pas votre tour de jouer.",
    GameOver = 'La commande est impossible car la partie est terminée.',
    ExchangeRequireLowercaseLetters = 'Les lettres à échanger doivent être en minuscule.',
}

export const PLAYER_NOT_FOUND = 'Aucun joueur actif trouvé';

export const WAIT_FOR_COMMAND_CONFIRMATION_MESSAGE = (gameId: string): Message => {
    return {
        content: "Veuillez attendre la confirmation de votre commande précédente avant d'en envoyer une autre.",
        senderId: SYSTEM_ID,
        gameId,
    };
};
