import ActionInfo from '@app/classes/actions/action-info';
import { GameUpdateData } from '@app/classes/communication/game-update-data';

export default class ActionHelp extends ActionInfo {
    // eslint-disable-next-line no-unused-vars
    execute(): GameUpdateData | void {
        const message =
            'placer: jouer un mot (!placer <ligne><colonne>[(h|v)] <lettres>)\n\
             echanger: changer des lettres pour des nouvelles (!echanger <lettres>)\n\
             passer: passer son tour (!passer)\n\
             reserve: affiche les lettres dans la réserve (!reserve)';
        // eslint-disable-next-line no-console
        console.log(message);
    }

    getMessage(): string | undefined {
        return undefined;
    }
}
