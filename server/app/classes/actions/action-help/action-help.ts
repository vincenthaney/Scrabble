import ActionInfo from '@app/classes/actions/action-info';

export default class ActionHelp extends ActionInfo {
    getMessage(): string {
        return 'placer: jouer un mot (!placer <ligne><colonne>[(h|v)] <lettres>)\n\
             echanger: changer des lettres pour des nouvelles (!echanger <lettres>)\n\
             passer: passer son tour (!passer)\n\
             reserve: affiche les lettres dans la réserve (!reserve)';
    }
    getOpponentMessage(): string | undefined {
        return undefined;
    }
}
