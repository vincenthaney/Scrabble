import { IStorableModel } from './istorablemodel';

export class VirtualPlayerName implements IStorableModel {
    name: string;
    isEditable: boolean;
    level: string;
    toJSON(): string {
        return '';
    }
}
