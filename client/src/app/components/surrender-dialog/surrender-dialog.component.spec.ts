import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurrenderDialogComponent } from './surrender-dialog.component';

describe('SurrenderDialogComponent', () => {
    let component: SurrenderDialogComponent;
    let fixture: ComponentFixture<SurrenderDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SurrenderDialogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SurrenderDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
