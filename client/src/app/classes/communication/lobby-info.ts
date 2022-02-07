import { LobbyData } from './lobby-data';

export interface LobbyInfo extends LobbyData {
    canJoin?: boolean;
}
