export interface VirtualPlayerData {
    name: string;
    level: VirtualPlayerLevel;
}

export enum VirtualPlayerLevel {
    Beginner = 'Débutant',
    Expert = 'Expert',
}
