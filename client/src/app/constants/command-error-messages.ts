export enum CommandErrorMessages {
    BadSyntax = 'La commande ne respecte pas la syntaxe requise.',
    PlaceBadSyntax = 'La commande placer doit suivre le format _!placer ‹position› ‹lettres›_',
    ExchangeBadSyntax = 'La commande échanger doit suivre le format _!échanger ‹lettres›_',
    PassBadSyntax = 'La commande passer doit suivre le format _!passer_',
    InvalidEntry = "Cette commande n'existe pas.",
    ImpossibleCommand = 'Cette commande est impossible à réaliser.',
    DontHaveTiles = "Vous n'avez pas les tuiles requises.",
    PositionFormat = 'La position doit être de format _‹a-o›‹1-15›‹h/v›_.',
    NotYourTurn = "Ce n'est pas votre tour de jouer.",
    ExhangeRequireLowercaseLettes = 'Les lettres à échanger doivent être en minuscule.',
}

export const PLAYER_NOT_FOUND = 'Current player could not be found';