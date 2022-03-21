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
import { AppMaterialModule } from '@app/modules/material.module';
import { GameDispatcherService } from '@app/services/';
import { IconComponent } from '@app/components/icon/icon.component';
import { ConvertDialogComponent } from './convert-dialog.component';

@Component({
    template: '',
})
class TestComponent {}

describe('ConvertDialogComponent', () => {
    let component: ConvertDialogComponent;
    let fixture: ComponentFixture<ConvertDialogComponent>;
    let gameDispatcherServiceMock: GameDispatcherService;

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
            const spy = spyOn(component, 'returnToWaiting');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should NOT call returnToWaiting if it is not converting ', () => {
            component.isConverting = true;
            const spy = spyOn(component, 'returnToWaiting');

            component.ngOnDestroy();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('onSubmit', () => {
        it('form should call handleConvertToSolo on submit', async () => {
            const spy = spyOn(component, 'handleConvertToSolo');
            component.onSubmit();
            expect(spy).toHaveBeenCalled();
        });

        it('form should set isConverting to true on submit', async () => {
            component.isConverting = false;
            spyOn(component, 'handleConvertToSolo').and.callFake(() => {
                return;
            });
            component.onSubmit();

            expect(component.isConverting).toBeTrue();
        });
    });

    describe('handleConvertToSolo', () => {
        it('form should call gameDispatcherService.handleRecreateGame', async () => {
            const spy = spyOn<any>(gameDispatcherServiceMock, 'handleRecreateGame');
            component.handleConvertToSolo();
            expect(spy).toHaveBeenCalled();
        });

        it('form should call gameDispatcherService.subscribeToReceivedGameIdEvent', async () => {
            const spy = spyOn<any>(gameDispatcherServiceMock, 'subscribeToReceivedGameIdEvent');
            component.handleConvertToSolo();
            expect(spy).toHaveBeenCalled();
        });

        it('createGame should reroute to waiting-room if multiplayer game', () => {
            const spy = spyOn<any>(component['router'], 'navigateByUrl');
            component.handleConvertToSolo();
            gameDispatcherServiceMock['receivedGameIdEvent'].next();
            expect(spy).toHaveBeenCalledWith('game');
        });
    });
});
