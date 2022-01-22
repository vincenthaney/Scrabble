import { IStorableModel } from './istorablemodel';

export class VirtualPlayerName extends IStorableModel {
    name: string;
    isEditable: boolean;
    level: string;

    constructor(name: string, isEditable: boolean, level: string) {
        super();
        throw new Error('Method not implemented.');
    }

    toJSON(): string {
        return super.toJSON();
    }
}
