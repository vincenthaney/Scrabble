import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VirtualPlayerProfile } from '@app/classes/admin';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerProfilesService {
    constructor(private http: HttpClient) {}

    fetchVirtualPlayerProfiles(level: string): VirtualPlayerProfile[] {
        throw new Error('Method not implemented.');
    }

    updateVirtualPlayerProfiles(virtualPlayerProfiles: VirtualPlayerProfile[]): void {
        throw new Error('Method not implemented.');
    }
}
