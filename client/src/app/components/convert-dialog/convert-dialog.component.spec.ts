/* eslint-disable max-classes-per-file */
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
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from '@app/components/icon/icon.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameDispatcherService } from '@app/services/';
import { Subject } from 'rxjs';
import { ConvertDialogComponent } from './convert-dialog.component';
import SpyObj = jasmine.SpyObj;

@Component({
    template: '',
})
class TestComponent {}

describe('ConvertDialogComponent', () => {
    let component: ConvertDialogComponent;
    let fixture: ComponentFixture<ConvertDialogComponent>;
    let gameDispatcherServiceSpy: SpyObj<GameDispatcherService>;
    let matDialogSpy: SpyObj<MatDialogRef<ConvertDialogComponent>>;
    let backdropSubject: Subject<MouseEvent>;

    beforeEach(() => {
        gameDispatcherServiceSpy = jasmine.createSpyObj('GameDispatcherService', ['handleRecreateGame']);
        gameDispatcherServiceSpy.handleRecreateGame.and.callFake(() => {});

        backdropSubject = new Subject();
        matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['backdropClick', 'close']);
        matDialogSpy.backdropClick.and.returnValue(backdropSubject.asObservable());
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
                NoopAnimationsModule,
                RouterTestingModule.withRoutes([
                    { path: 'waiting-room', component: TestComponent },
                    { path: 'game', component: TestComponent },
                ]),
            ],
            providers: [
                MatButtonToggleHarness,
                MatButtonHarness,
                MatButtonToggleGroupHarness,
                { provide: GameDispatcherService, useValue: gameDispatcherServiceSpy },
                { provide: MatDialogRef, useValue: matDialogSpy },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConvertDialogComponent);
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
    });

    describe('onSubmit', () => {
        it('should call handleRecreateGame with params', () => {
            component.onSubmit();
            expect(gameDispatcherServiceSpy.handleRecreateGame).toHaveBeenCalledWith(component.gameParameters);
        });

        it('should close the dialog with isConverting = true', () => {
            component.onSubmit();

            expect(matDialogSpy.close).toHaveBeenCalledWith({ isConverting: true });
        });
    });

    describe('returnToWaiting', () => {
        it('should call handleRecreateGame wit no params', () => {
            component.returnToWaiting();
            expect(gameDispatcherServiceSpy.handleRecreateGame).toHaveBeenCalledWith();
        });

        it('should close the dialog with isConverting = false', () => {
            component.returnToWaiting();

            expect(matDialogSpy.close).toHaveBeenCalledWith({ isConverting: false });
        });
    });

    describe('setupDialog', () => {
        it('should disable closing', () => {
            component['dialogRef'].disableClose = false;

            component['setupDialog']();

            expect(component['dialogRef'].disableClose).toBeTrue();
        });

        it('should call returnToWaiting when backdrop is clicked', () => {
            component['setupDialog']();
            const returnSpy = spyOn(component, 'returnToWaiting').and.callFake(() => {});

            backdropSubject.next();

            expect(returnSpy).toHaveBeenCalled();
        });
    });
});
