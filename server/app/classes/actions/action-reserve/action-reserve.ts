import ActionInfo from '@app/classes/actions/action-info';

export default class ActionReserve extends ActionInfo {
    getMessage(): string | undefined {
        return Array.from(this.game.getTilesLeftPerLetter(), ([v, k]) => [v, k])
            .map(([letter, amount]) => `**<span>${letter}</span>**: ${amount}`)
            .join('<br>');
    }

    getOpponentMessage(): undefined {
        return undefined;
    }
}
