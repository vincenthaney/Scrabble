/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from '@app/components/icon/icon.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppMaterialModule } from '@app/modules/material.module';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profiles.service';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { DeleteVirtualPlayerDialogParameters } from '@app/components/admin-virtual-players/admin-virtual-players.types';
import { DeleteVirtualPlayerDialogComponent } from './delete-virtual-player-dialog.component';
export class MatDialogMock {
    close() {
        return {
            close: () => ({}),
        };
    }
}

const MODEL: DeleteVirtualPlayerDialogParameters = {
    name: 'testName',
    level: VirtualPlayerLevel.Beginner,
    id: 'eyedee',
    onClose: () => {
        return;
    },
};

describe('DeleteVirtualPlayerDialogComponent', () => {
    let component: DeleteVirtualPlayerDialogComponent;
    let fixture: ComponentFixture<DeleteVirtualPlayerDialogComponent>;
    let service: VirtualPlayerProfilesService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DeleteVirtualPlayerDialogComponent, IconComponent, PageHeaderComponent],
            imports: [
                AppMaterialModule,
                HttpClientModule,
                MatFormFieldModule,
                MatSelectModule,
                MatDividerModule,
                MatProgressSpinnerModule,
                MatDialogModule,
                MatSnackBarModule,
                BrowserAnimationsModule,
                MatCardModule,
                MatTabsModule,
            ],
            providers: [
                MatDialog,
                {
                    provide: MatDialogRef,
                    useClass: MatDialogMock,
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: MODEL,
                },
                VirtualPlayerProfilesService,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DeleteVirtualPlayerDialogComponent);
        service = TestBed.inject(VirtualPlayerProfilesService);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('deleteVirtualPlayer', () => {
        let spyDelete: jasmine.Spy;
        let spyClose: jasmine.Spy;
        beforeEach(() => {
            spyDelete = spyOn(service, 'deleteVirtualPlayer').and.callFake(async () => {
                return;
            });
            spyClose = spyOn(component['dialogRef'], 'close').and.callFake(async () => {
                return;
            });
        });

        it('should call virtualPlayerProfilesService.deleteVirtualPlayer', async () => {
            await component.deleteVirtualPlayer();
            expect(spyDelete).toHaveBeenCalled();
        });

        it('should call this.dialogRef.close', async () => {
            await component.deleteVirtualPlayer();
            expect(spyClose).toHaveBeenCalled();
        });
    });
});
