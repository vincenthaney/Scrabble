import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VirtualPlayerProfile, VirtualPlayerProfilesData } from '@app/classes/admin/virtual-player-profile';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerProfilesController {
    private endpoint = `${environment.serverUrl}/virtualPlayerProfiles`;

    constructor(private readonly http: HttpClient) {}

    getAllVirtualPlayerProfiles(): Observable<VirtualPlayerProfilesData> {
        return this.http.get<VirtualPlayerProfilesData>(this.endpoint);
    }

    getVirtualPlayerProfilesFromLevel(level: VirtualPlayerLevel): Observable<VirtualPlayerProfilesData> {
        return this.http.get<VirtualPlayerProfilesData>(`${this.endpoint}/${level}`);
    }

    createVirtualPlayerProfile(newProfile: VirtualPlayerProfile): Observable<void> {
        return this.http.post<void>(this.endpoint, { virtualPlayerProfile: newProfile });
    }

    updateVirtualPlayerProfile(profileId: string, newName: string): Observable<void> {
        return this.http.patch<void>(`${this.endpoint}/${profileId}`, { newName });
    }

    deleteVirtualPlayerProfile(profileId: string): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${profileId}`);
    }

    resetVirtualPlayerProfiles(): Observable<void> {
        return this.http.delete<void>(this.endpoint);
    }
}
