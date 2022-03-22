export const removeAccents = (word: string) => word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
