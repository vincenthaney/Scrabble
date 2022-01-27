import Opponent from './opponent';

export default class OnlinePlayer extends Opponent {
    constructor(name: string) {
        super(name);
    }

    startRound(): void {
        throw new Error('Method not implemented.');
    }
}
