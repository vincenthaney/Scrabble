import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';

export interface VirtualPlayerProfile {
    name: string;
    level: VirtualPlayerLevel;
    isDefault: boolean;
}

export interface VirtualPlayerProfilesData {
    virtualPlayerProfiles: VirtualPlayerProfile[];
}
