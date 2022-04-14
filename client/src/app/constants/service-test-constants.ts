import { VirtualPlayerProfile } from '@app/classes/communication/virtual-player-profiles';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';

export const MOCK_PLAYER_PROFILES: VirtualPlayerProfile[] = [
    {
        name: 'Jean Charest',
        level: VirtualPlayerLevel.Beginner,
        isDefault: false,
    },
    {
        name: 'Thomas "The best" Trépanier',
        level: VirtualPlayerLevel.Expert,
        isDefault: false,
    },
];

export const MOCK_PLAYER_PROFILE_MAP: Map<VirtualPlayerLevel, string[]> = new Map([
    [VirtualPlayerLevel.Beginner, [MOCK_PLAYER_PROFILES[0].name]],
    [VirtualPlayerLevel.Expert, [MOCK_PLAYER_PROFILES[1].name]],
]);
