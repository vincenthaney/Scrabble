import { StorableModel } from '@app/classes/admin';

export default class VirtualPlayerProfile extends StorableModel {
    name: string;
    isEditable: boolean;
    level: string;

    constructor(name: string, isEditable: boolean, level: string) {
        super();
        throw new Error('Method not implemented.');
    }
}
