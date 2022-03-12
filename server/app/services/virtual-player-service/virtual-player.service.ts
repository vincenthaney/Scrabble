import { ActionData } from '@app/classes/communication/action-data';
import { Service } from 'typedi';

@Service()
export class VirtualPlayerService {
    sendAction(gameId: string, playerId: string, action: ActionData): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${playerId}/action`;
        this.http.post(endpoint, { type: action.type, payload: action.payload, input: action.input }).subscribe();
    }
}
