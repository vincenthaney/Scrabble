import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VirtualPlayerProfile, VirtualPlayerProfilesData } from '@app/classes/admin/virtual-player-profile';
import { ERROR_SNACK_BAR_CONFIG } from '@app/constants/components-constants';
import { VirtualPlayerProfilesController } from '@app/controllers/virtual-player-profiles-controller/virtual-player-profiles.controller';
import { retry } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerProfilesService {
    constructor(private readonly virtualPlayerProfilesController: VirtualPlayerProfilesController, private readonly snackBar: MatSnackBar) {}

    async getVirtualPlayerProfiles(): Promise<VirtualPlayerProfile[]> {
        return new Promise((resolve, reject) => {
            this.virtualPlayerProfilesController
                .getAllVirtualPlayerProfiles()
                .pipe(retry(1))
                .subscribe(
                    (result: VirtualPlayerProfilesData) => resolve(result.virtualPlayerProfiles),
                    (err: HttpErrorResponse) => {
                        this.handleError(err);
                        reject(err);
                    },
                );
        });
    }

    private handleError(err: HttpErrorResponse): void {
        this.snackBar.open(err.error.message, 'Fermer', ERROR_SNACK_BAR_CONFIG);
    }
}
