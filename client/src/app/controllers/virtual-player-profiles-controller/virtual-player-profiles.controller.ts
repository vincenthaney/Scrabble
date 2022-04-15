import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { VirtualPlayerData, VirtualPlayerProfile, VirtualPlayerProfilesData } from '@app/classes/admin/virtual-player-profile';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { PositiveFeedback } from '@app/constants/virtual-players-components';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerProfilesController implements OnDestroy {
    private endpoint = `${environment.serverUrl}/virtualPlayerProfiles`;
    private virtualPlayerServerResponseEvent: Subject<string> = new Subject();
    private getAllVirtualPlayersEvent: Subject<VirtualPlayerProfile[]> = new Subject();
    private virtualPlayerErrorEvent: Subject<string> = new Subject();
    private serviceDestroyed$: Subject<boolean> = new Subject();
    constructor(private readonly http: HttpClient) {}

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    async handleGetAllVirtualPlayerProfilesEvent(): Promise<void> {
        this.http.get<VirtualPlayerProfilesData>(this.endpoint, { observe: 'body' }).subscribe(
            (body) => {
                this.getAllVirtualPlayersEvent.next(body.virtualPlayerProfiles);
            },
            (error) => {
                this.virtualPlayerErrorEvent.next(error.error.message);
            },
        );
    }

    async handleCreateVirtualPlayerProfileEvent(newProfileData: VirtualPlayerData): Promise<void> {
        this.http.post(this.endpoint, { virtualPlayerData: newProfileData }).subscribe(
            () => {
                this.virtualPlayerServerResponseEvent.next(PositiveFeedback.VirtualPlayerCreated);
            },
            (error) => {
                this.virtualPlayerErrorEvent.next(error.error.message);
            },
        );
    }

    async handleUpdateVirtualPlayerProfileEvent(profileData: VirtualPlayerData): Promise<void> {
        this.http.patch<void>(`${this.endpoint}/${profileData.id}`, { profileData }).subscribe(
            () => {
                this.virtualPlayerServerResponseEvent.next(PositiveFeedback.VirtualPlayerUpdated);
            },
            (error) => {
                this.virtualPlayerErrorEvent.next(error.error.message);
            },
        );
    }

    async handleDeleteVirtualPlayerProfileEvent(profileId: string): Promise<void> {
        this.http.delete<void>(`${this.endpoint}/${profileId}`).subscribe(
            () => {
                this.virtualPlayerServerResponseEvent.next(PositiveFeedback.VirtualPlayerDeleted);
            },
            (error) => {
                this.virtualPlayerErrorEvent.next(error.error.message);
            },
        );
    }

    async handleResetVirtualPlayerProfilesEvent(): Promise<void> {
        this.http.delete<void>(this.endpoint).subscribe(
            () => {
                this.virtualPlayerServerResponseEvent.next(PositiveFeedback.VirtualPlayersDeleted);
            },
            (error) => {
                this.virtualPlayerErrorEvent.next(error.error.message);
            },
        );
    }

    getVirtualPlayerProfilesFromLevel(level: VirtualPlayerLevel): Observable<VirtualPlayerProfilesData> {
        return this.http.get<VirtualPlayerProfilesData>(`${this.endpoint}/${level}`);
    }

    subscribeToGetAllVirtualPlayersEvent(serviceDestroyed$: Subject<boolean>, callback: (response: VirtualPlayerProfile[]) => void): void {
        this.getAllVirtualPlayersEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToVirtualPlayerErrorEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
        this.virtualPlayerErrorEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToVirtualPlayerServerResponseEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
        this.virtualPlayerServerResponseEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }
}
