const MIN_LENGTH = 2;
const MAX_LENGTH = 20;
const VALIDATION_RULE = "^([a-zA-Z0-9]+[ '\\-]{0,1})*$";

export const NAME_VALIDATION = {
    minLength: MIN_LENGTH,
    maxLength: MAX_LENGTH,
    rule: VALIDATION_RULE,
};
