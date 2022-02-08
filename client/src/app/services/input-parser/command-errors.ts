import { CommandErrorMessages } from './command-error-messages';

export class CommandError extends Error {
    constructor(message: CommandErrorMessages) {
        super(message);
        Object.setPrototypeOf(this, CommandError.prototype);
        this.name = 'CommandError';
    }
}
