import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NameFieldComponent } from './name-field.component';

const fakeNameChange = () => {
    return false;
};

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

    it('onNameChange should change the playerName', () => {
        const expected = 'ThOm';
        component.playerName = 'Charles';
        component.onNameChange(expected);
        expect(component.playerName).toBe(expected);
    });

    it('onNameChange should emit isInputNameValid true with a valid name', () => {
        const spy = spyOn(component.isInputNameValid, 'emit').and.callFake(fakeNameChange);
        component.formParameters.patchValue({ inputName: 'testName' });
        component.onNameChange('testName');
        expect(spy).toHaveBeenCalled();
        expect(component.isInputNameValid.emit).toHaveBeenCalledWith(true);
    });

    it('onNameChange should emit isInputNameValid false with an invalid name', () => {
        const spy = spyOn(component.isInputNameValid, 'emit').and.callFake(fakeNameChange);
        component.formParameters.patchValue({ inputName: '!nval!dName' });
        component.onNameChange('!nval!dName');
        expect(spy).toHaveBeenCalled();
        expect(component.isInputNameValid.emit).toHaveBeenCalledWith(false);
    });
});
