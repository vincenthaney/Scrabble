import { CommandExceptionMessages } from '@app/constants/command-exception-messages';

export default class CommandException extends Error {
    constructor(message: CommandExceptionMessages) {
        super(message);
        Object.setPrototypeOf(this, CommandException.prototype);
        this.name = 'CommandError';
    }
}
