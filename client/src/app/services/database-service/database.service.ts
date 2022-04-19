import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import ConnectionStateService, { ConnectionState } from '@app/classes/connection-state-service/connection-state-service';
import { environment } from 'src/environments/environment';

export const ENDPOINT = `${environment.serverUrl}/database/connected`;

@Injectable({
    providedIn: 'root',
})
export class DatabaseService extends ConnectionStateService {
    constructor(private readonly http: HttpClient) {
        super();
    }

    checkDatabase() {
        this.http.get(ENDPOINT).subscribe(
            () => this.nextState(ConnectionState.Connected),
            () => this.nextState(ConnectionState.Error),
        );
    }
}
