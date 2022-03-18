import { ActionData } from '@app/classes/communication/action-data';
import { Service } from 'typedi';
import fetch from 'node-fetch';
import { environment } from '@app/environments/environment';

@Service()
export class VirtualPlayerService {
    sendAction(gameId: string, playerId: string, action: ActionData): void {
        console.log('VIRTUAL PLAYER POSTING');
        fetch(`${environment.serverUrl}/games/${gameId}/players/${playerId}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: action.type, payload: action.payload, input: action.input }),
        });
    }
}
