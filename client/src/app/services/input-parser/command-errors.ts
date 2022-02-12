import { CommandErrorMessages } from './command-error-messages';

export default class CommandError extends Error {
    constructor(message: CommandErrorMessages) {
        super(message);
        Object.setPrototypeOf(this, CommandError.prototype);
        this.name = 'CommandError';
    }
}
