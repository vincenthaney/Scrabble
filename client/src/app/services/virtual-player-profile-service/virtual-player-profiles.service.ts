import { Injectable } from '@angular/core';
import { VirtualPlayerData, VirtualPlayerProfile } from '@app/classes/admin/virtual-player-profile';
import { VirtualPlayerProfilesController } from '@app/controllers/virtual-player-profiles-controller/virtual-player-profiles.controller';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerProfilesService {
    virtualPlayerProfiles: VirtualPlayerProfile[];
    private serviceDestroyed$: Subject<boolean>;
    private virtualPlayersUpdateEvent: Subject<VirtualPlayerProfile[]>;
    private componentUpdateEvent: Subject<string>;
    private requestSentEvent: Subject<undefined>;
    constructor(private readonly virtualPlayerProfilesController: VirtualPlayerProfilesController) {
        this.serviceDestroyed$ = new Subject();
        this.virtualPlayersUpdateEvent = new Subject();
        this.componentUpdateEvent = new Subject();
        this.requestSentEvent = new Subject();
        this.virtualPlayerProfilesController.subscribeToGetAllVirtualPlayersEvent(this.serviceDestroyed$, (profiles) => {
            this.virtualPlayerProfiles = profiles;
            this.virtualPlayersUpdateEvent.next(profiles);
        });
        this.virtualPlayerProfilesController.subscribeToVirtualPlayerServerResponseEvent(this.serviceDestroyed$, async (message) => {
            this.requestSentEvent.next();
            this.componentUpdateEvent.next(message);
            await this.getAllVirtualPlayersProfile();
        });
        this.virtualPlayerProfilesController.subscribeToVirtualPlayerErrorEvent(this.serviceDestroyed$, async (message) => {
            this.componentUpdateEvent.next(message);
            await this.getAllVirtualPlayersProfile();
        });
    }

    async createVirtualPlayer(virtualPlayerData: VirtualPlayerData): Promise<void> {
        await this.virtualPlayerProfilesController.handleCreateVirtualPlayerProfileEvent(virtualPlayerData);
    }

    async updateVirtualPlayer(virtualPlayerData: VirtualPlayerData): Promise<void> {
        await this.virtualPlayerProfilesController.handleUpdateVirtualPlayerProfileEvent(virtualPlayerData);
    }

    async getAllVirtualPlayersProfile(): Promise<void> {
        await this.virtualPlayerProfilesController.handleGetAllVirtualPlayerProfilesEvent();
    }

    async resetVirtualPlayerProfiles(): Promise<void> {
        await this.virtualPlayerProfilesController.handleResetVirtualPlayerProfilesEvent();
    }

    async deleteVirtualPlayer(id: string): Promise<void> {
        await this.virtualPlayerProfilesController.handleDeleteVirtualPlayerProfileEvent(id);
    }

    subscribeToVirtualPlayerProfilesUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (profiles: VirtualPlayerProfile[]) => void): void {
        this.virtualPlayersUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }
    subscribeToComponentUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (message: string) => void): void {
        this.componentUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }
    subscribeToRequestSentEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
        this.requestSentEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }
}
