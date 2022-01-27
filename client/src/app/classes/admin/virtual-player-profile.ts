import { StorableModel } from '@app/classes/admin';
import { VirtualPlayerLevel } from '../player/virtual-player-level';

export default class VirtualPlayerProfile extends StorableModel {
    name: string;
    isEditable: boolean;
    level: VirtualPlayerLevel;

    // constructor(name: string, isEditable: boolean, level: string) {
    //     super();
    //     throw new Error('Method not implemented.');
    // }
}
