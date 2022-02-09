interface HelpAction {
    command: string;
    usage?: string;
    description: string;
}

export const HELP_ACTIONS: HelpAction[] = [
    {
        command: 'placer',
        usage: '<ligne><colonne>[(h|v)] <lettres>',
        description: 'jouer un mot',
    },
    {
        command: 'echanger',
        usage: '<lettres>',
        description: 'changer des lettres de son chevalet pour des lettres de la réserve',
    },
    {
        command: 'passer',
        description: 'passer son tour',
    },
    {
        command: 'reserve',
        description: 'affiche les lettres dans la réserve',
    },
];
