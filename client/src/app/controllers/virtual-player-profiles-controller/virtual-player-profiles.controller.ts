import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VirtualPlayerProfileData } from '@app/classes/communication/virtual-player-profiles';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerProfilesController {
    private endpoint = `${environment.serverUrl}/virtualPlayerProfiles`;

    constructor(private readonly http: HttpClient) {}

    getVirtualPlayerProfiles(): Observable<VirtualPlayerProfileData> {
        return this.http.get<VirtualPlayerProfileData>(this.endpoint);
    }
}
