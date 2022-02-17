const VALIDATION_RULE = "^([a-zA-Z0-9éèêàâëï]+[ '\\-_]{0,1})*$";

export const validateName = (name: string) => RegExp(VALIDATION_RULE).test(name);
