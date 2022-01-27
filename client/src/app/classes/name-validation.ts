const MIN_LENGTH: number = 2;
const MAX_LENGTH: number = 20;
const VALIDATION_RULE: string = "^([a-zA-Z0-9]+[ '\\-]{0,1})*$";

export abstract class NameValidation {
    public static readonly minLength: number = MIN_LENGTH;
    public static readonly maxLength: number = MAX_LENGTH;
    public static readonly rule: string = VALIDATION_RULE;
}
