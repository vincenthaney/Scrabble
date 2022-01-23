import { StorableModel } from '@app/classes/admin';

export default class VirtualPlayerProfile extends StorableModel {
    name: string;
    isEditable: boolean;
    level: string;
}
