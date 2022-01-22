import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VirtualPlayerName } from '@app/classes/admin/virtual-player-name';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerNamesService {
    constructor(private http: HttpClient) {}

    fetchVirtualPlayerNames(level: string): VirtualPlayerName[] {
        return [];
    }

    updateVirtualPlayerNames(virtualPlayerNames: VirtualPlayerName[]): void {
        return;
    }
}
