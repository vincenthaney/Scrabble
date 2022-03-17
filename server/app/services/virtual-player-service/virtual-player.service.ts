import { ActionData } from '@app/classes/communication/action-data';
import { Service } from 'typedi';
import fetch from 'node-fetch';
import { environment } from '@app/environments/environment';

@Service()
export class VirtualPlayerService {
    sendAction(gameId: string, playerId: string, action: ActionData): void {
        fetch(`${environment.serverUrl}/games/${gameId}/players/${playerId}/action`, {
            method: 'POST',
            body: JSON.stringify({ type: action.type, payload: action.payload, input: action.input }),
        });
    }
}