import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonToggleGroupHarness, MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameCreationPageComponent } from './game-creation-page.component';

@Component({
    template: '',
})
class TestComponent {}

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCreationPageComponent, TestComponent],
            imports: [
                AppMaterialModule,
                BrowserAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                CommonModule,
                MatButtonToggleModule,
                MatButtonModule,
                MatFormFieldModule,
                MatSelectModule,
                MatInputModule,
                RouterTestingModule.withRoutes([
                    { path: 'waiting-room', component: TestComponent },
                    { path: 'home', component: TestComponent },
                    { path: 'game-creation', component: GameCreationPageComponent },
                ]),
            ],
            providers: [MatButtonToggleHarness, MatButtonHarness, MatButtonToggleGroupHarness],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCreationPageComponent);
        // loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // TODO : finish tests

    // it('clicking on LOG2990 button should set gameType attribute to LOG2990', async () => {
    //   component.gameType = component.GameType.Classic;
    //   const log2990Button = await loader.getHarness(MatButtonToggleGroupHarness.with({
    //     selector: '#first'
    //   }));
    //   console.log("truc: " + await log2990Button.getAppearance());
    //   console.log('value: ' + component.gameType);
    //   console.log("truc: " + await log2990Button.isVertical());
    //   console.log('value: ' + component.gameType)
    //   expect(component.gameType).toEqual(component.GameType.LOG2990);
    // });

    // it('2 clicking on LOG2990 button should set gameType attribute to LOG2990', () => {
    //   component.gameType = component.gameTypes.Classic;
    //   const log2990Button = fixture.debugElement.nativeElement.querySelector('#log2990-button');
    //   log2990Button.dispatchEvent(new Event('change'));
    //   expect(component.gameType).toEqual(component.gameTypes.LOG2990);
    // });

    // it('clicking on Classic button should set gameType attribute to Classic', () => {
    //   component.gameType = component.GameType.LOG2990;
    //   fixture.debugElement.nativeElement.querySelector('#classic-button').nativeElement.click();
    //   expect(component.gameType).toEqual(component.GameType.Classic);
    // });

    it('initial value of form fields should be empty', async () => {
        const gameParametersForm = component.gameParameters;
        const initialFormValues = {
            inputTimer: '',
            inputDict: '',
            inputName: '',
        };
        expect(gameParametersForm.value).toEqual(initialFormValues);
    });

    it('form should be invalid if all fields are empty', async () => {
        const gameParametersForm = component.gameParameters;
        const initialFormValues = {
            inputTimer: '',
            inputDict: '',
            inputName: '',
        };
        gameParametersForm.setValue(initialFormValues);
        expect(gameParametersForm.valid).toBeFalsy();
    });

    it('form should not be valid if inputTimer is empty', () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            inputTimer: '',
            inputDict: 'default-dict',
            inputName: 'something',
        };
        gameParametersForm.setValue(formValues);
        expect(gameParametersForm.valid).toBeFalsy();
    });

    it('form should not be valid if inputDict is empty', () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            inputTimer: '30',
            inputDict: '',
            inputName: 'something',
        };
        gameParametersForm.setValue(formValues);
        expect(gameParametersForm.valid).toBeFalsy();
    });

    it('form should not be valid if inputName is empty', () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            inputTimer: '30',
            inputDict: 'french-dict',
            inputName: '',
        };
        gameParametersForm.setValue(formValues);
        expect(gameParametersForm.valid).toBeFalsy();
    });

    it('form should call onSubmit when submit button is clicked', async () => {
        const spy = spyOn(component, 'onSubmit');
        const submitButton = fixture.debugElement.nativeElement.querySelector('#create-game-button');
        submitButton.click();
        expect(spy).toHaveBeenCalled();
    });

    it('form should not call createGame on submit if invalid', async () => {
        const spy = spyOn(component, 'createGame');

        const gameParametersForm = component.gameParameters;
        gameParametersForm.setErrors({ error: true });

        const submitButton = fixture.debugElement.nativeElement.querySelector('#create-game-button');
        submitButton.click();

        expect(spy).not.toHaveBeenCalled();
    });

    it('form should call createGame on submit if valid', async () => {
        const spy = spyOn(component, 'createGame');

        const gameParametersForm = component.gameParameters;
        const validInputs = {
            inputTimer: '30',
            inputDict: 'french-dict',
            inputName: 'nom valide',
        };
        gameParametersForm.setValue(validInputs);

        const submitButton = fixture.debugElement.nativeElement.querySelector('#create-game-button');
        submitButton.click();

        expect(spy).toHaveBeenCalled();
    });

    it('createGame button should reroute to waiting-room page if form is valid', async () => {
        const location: Location = TestBed.inject(Location);

        const gameParametersForm = component.gameParameters;
        const validInputs = {
            inputTimer: '30',
            inputDict: 'french-dict',
            inputName: 'nom valide',
        };
        gameParametersForm.setValue(validInputs);

        const backButton = fixture.debugElement.nativeElement.querySelector('#create-game-button');
        backButton.click();

        return fixture.whenStable().then(() => {
            expect(location.path()).toBe('/waiting-room');
        });
    });

    it('back button should reroute to home page', async () => {
        const location: Location = TestBed.inject(Location);

        const backButton = fixture.debugElement.nativeElement.querySelector('#back-button');
        backButton.click();

        return fixture.whenStable().then(() => {
            expect(location.path()).toBe('/home');
        });
    });
});
