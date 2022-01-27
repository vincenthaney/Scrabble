const MIN_LENGTH = 2;
const MAX_LENGTH = 20;
const VALIDATION_RULE = "^([a-zA-Z0-9]+[ '\\-]{0,1})*$";

export abstract class NameValidation {
    static readonly minLength: number = MIN_LENGTH;
    static readonly maxLength: number = MAX_LENGTH;
    static readonly rule: string = VALIDATION_RULE;
}
