import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NameFieldComponent } from './name-field.component';

describe('NameFieldComponent', () => {
    let component: NameFieldComponent;
    let fixture: ComponentFixture<NameFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NameFieldComponent],
            imports: [BrowserAnimationsModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NameFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onNameFieldChange should change the playerName', () => {
        const expected = 'ThOm';
        component.playerName = 'Charles';
        component.onNameFieldChange(expected);
        expect(component.playerName).toBe(expected);
    });

    it('onNameFieldChange should emit nameChange', () => {
        const fakeNameChange = () => {
            return false;
        };
        const spy = spyOn(component.nameChange, 'emit').and.callFake(fakeNameChange);
        component.onNameFieldChange('Charles');
        expect(spy).toHaveBeenCalled();
        expect(component.nameChange.emit).toHaveBeenCalledWith(true);
    });
});
