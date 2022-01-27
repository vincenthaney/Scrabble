export abstract class NameValidation {
    static readonly MIN_LENGTH: number = 2;
    static readonly MAX_LENGTH: number = 20;
    static readonly RULE: string = "^([a-zA-Z0-9]+[ '\\-]{0,1})*$";
}