/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonToggleGroupHarness, MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { VirtualPlayerProfile } from '@app/classes/communication/virtual-player-profiles';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { IconComponent } from '@app/components/icon/icon.component';
import { MOCK_PLAYER_PROFILES } from '@app/constants/service-test-constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameDispatcherService } from '@app/services/';
import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profiles.service';
import { ConvertDialogComponent } from './convert-dialog.component';
import SpyObj = jasmine.SpyObj;

@Component({
    template: '',
})
class TestComponent {}

describe('ConvertDialogComponent', () => {
    let component: ConvertDialogComponent;
    let fixture: ComponentFixture<ConvertDialogComponent>;
    let gameDispatcherServiceMock: GameDispatcherService;
    let virtualPlayerProfileSpy: SpyObj<VirtualPlayerProfilesService>;

    beforeEach(() => {
        virtualPlayerProfileSpy = jasmine.createSpyObj('VirtualPlayerProfilesService', ['getVirtualPlayerProfiles']);
        virtualPlayerProfileSpy.getVirtualPlayerProfiles.and.resolveTo(MOCK_PLAYER_PROFILES);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConvertDialogComponent, TestComponent, IconComponent],
            imports: [
                AppMaterialModule,
                HttpClientModule,
                BrowserAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                CommonModule,
                MatButtonToggleModule,
                MatButtonModule,
                MatFormFieldModule,
                MatSelectModule,
                MatCardModule,
                MatInputModule,
                MatDialogModule,
                RouterTestingModule.withRoutes([
                    { path: 'waiting-room', component: TestComponent },
                    { path: 'game', component: TestComponent },
                ]),
            ],
            providers: [
                MatButtonToggleHarness,
                MatButtonHarness,
                MatButtonToggleGroupHarness,
                GameDispatcherService,
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: VirtualPlayerProfilesService, useValue: virtualPlayerProfileSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConvertDialogComponent);
        gameDispatcherServiceMock = TestBed.inject(GameDispatcherService);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should subscribe to level value change', () => {
            const spy = spyOn<any>(component.gameParameters.get('virtualPlayerName'), 'reset').and.callFake(() => {});
            component.gameParameters.patchValue({ level: VirtualPlayerLevel.Expert });
            expect(spy).toHaveBeenCalled();
        });

        it('should initialize virtual player profiles', (done) => {
            component['virtualPlayerProfiles'] = [];
            spyOn(component, 'getVirtualPlayerNames').and.returnValues([MOCK_PLAYER_PROFILES[0].name]);
            component.ngOnInit();

            setTimeout(() => {
                expect(component['virtualPlayerProfiles']).toEqual(MOCK_PLAYER_PROFILES);
                done();
            });
        });
    });

    describe('ngOndestroy', () => {
        it('should always call next and complete on ngUnsubscribe', () => {
            const ngUnsubscribeNextSpy = spyOn<any>(component.pageDestroyed$, 'next');
            const ngUnsubscribeCompleteSpy = spyOn<any>(component.pageDestroyed$, 'complete');

            component.ngOnDestroy();
            expect(ngUnsubscribeNextSpy).toHaveBeenCalled();
            expect(ngUnsubscribeCompleteSpy).toHaveBeenCalled();
        });

        it('should call returnToWaiting if it is not converting ', () => {
            component.isConverting = false;
            const spy = spyOn<any>(component, 'returnToWaiting');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should NOT call returnToWaiting if it is not converting ', () => {
            component.isConverting = true;
            const spy = spyOn<any>(component, 'returnToWaiting');

            component.ngOnDestroy();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('onSubmit', () => {
        it('form should call handleConvertToSolo on submit', async () => {
            const spy = spyOn<any>(component, 'handleConvertToSolo');
            component.onSubmit();
            expect(spy).toHaveBeenCalled();
        });

        it('form should set isConverting to true on submit', async () => {
            component.isConverting = false;
            spyOn<any>(component, 'handleConvertToSolo').and.callFake(() => {
                return;
            });
            component.onSubmit();

            expect(component.isConverting).toBeTrue();
        });
    });

    describe('handleConvertToSolo', () => {
        it('form should call gameDispatcherService.handleRecreateGame', async () => {
            const spy = spyOn<any>(gameDispatcherServiceMock, 'handleRecreateGame');
            component['handleConvertToSolo']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('getVirtualPlayerNames', () => {
        it('should return empty string if no virtual player profiles', () => {
            component['virtualPlayerProfiles'] = undefined as unknown as VirtualPlayerProfile[];
            expect(component.getVirtualPlayerNames()).toEqual(['']);
        });

        it('should return all names of profiles with Beginner level if this level is selected', () => {
            component['virtualPlayerProfiles'] = MOCK_PLAYER_PROFILES;

            component.gameParameters.patchValue({ level: VirtualPlayerLevel.Beginner });
            const expectedResult: string[] = MOCK_PLAYER_PROFILES.filter(
                (profile: VirtualPlayerProfile) => profile.level === VirtualPlayerLevel.Beginner,
            ).map((profile: VirtualPlayerProfile) => profile.name);

            expect(component.getVirtualPlayerNames()).toEqual(expectedResult);
        });

        it('should return all names of profiles with Expert level if this level is selected', () => {
            component['virtualPlayerProfiles'] = MOCK_PLAYER_PROFILES;

            component.gameParameters.patchValue({ level: VirtualPlayerLevel.Expert });
            const expectedResult: string[] = MOCK_PLAYER_PROFILES.filter(
                (profile: VirtualPlayerProfile) => profile.level === VirtualPlayerLevel.Expert,
            ).map((profile: VirtualPlayerProfile) => profile.name);

            expect(component.getVirtualPlayerNames()).toEqual(expectedResult);
        });
    });
});
