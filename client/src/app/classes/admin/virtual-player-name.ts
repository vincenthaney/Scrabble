import { StorableModel } from '@app/classes/admin/storable-model';

export class VirtualPlayerName extends StorableModel {
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
