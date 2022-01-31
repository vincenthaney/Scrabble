import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
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
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameCreationPageComponent } from './game-creation-page.component';

@Component({
    template: '',
})
class TestComponent {}

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let loader: HarnessLoader;

    const setValidValues = () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            gameType: component.gameTypes.Classic,
            gameMode: component.gameModes.Solo,
            level: component.virtualPlayerLevels.Beginner,
            timer: '30',
            dict: 'french-dict',
        };
        gameParametersForm.setValue(formValues);
        component.child.formParameters.get('inputName')?.setValue('name');
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCreationPageComponent, NameFieldComponent, TestComponent],
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
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('clicking on LOG2990 button should set gameType attribute to LOG2990', async () => {
        const gameTypeField = component.gameParameters.get('gameType');
        gameTypeField?.setValue(component.gameTypes.Classic);

        const log2990Button = await loader.getHarness(
            MatButtonToggleHarness.with({
                selector: '#log2990-button',
            }),
        );
        await log2990Button.toggle();
        expect(gameTypeField?.value).toEqual(component.gameTypes.LOG2990);
    });

    it('clicking on Classic button should set gameType attribute to Classic', async () => {
        const gameTypeField = component.gameParameters.get('gameType');
        gameTypeField?.setValue(component.gameTypes.LOG2990);

        const classicButton = await loader.getHarness(
            MatButtonToggleHarness.with({
                selector: '#classic-button',
            }),
        );
        await classicButton.toggle();
        expect(gameTypeField?.value).toEqual(component.gameTypes.Classic);
    });

    it('clicking on Solo button should set gameMode attribute to Solo', async () => {
        const gameModeField = component.gameParameters.get('gameMode');
        gameModeField?.setValue(component.gameModes.Multiplayer);

        const soloButton = await loader.getHarness(
            MatButtonToggleHarness.with({
                selector: '#solo-button',
            }),
        );
        await soloButton.toggle();
        expect(gameModeField?.value).toEqual(component.gameModes.Solo);
    });

    it('clicking on Multiplayer button should set gameMode attribute to Solo', async () => {
        const gameModeField = component.gameParameters.get('gameMode');
        gameModeField?.setValue(component.gameModes.Solo);

        const multiplayerButton = await loader.getHarness(
            MatButtonToggleHarness.with({
                selector: '#multi-button',
            }),
        );
        await multiplayerButton.toggle();
        expect(gameModeField?.value).toEqual(component.gameModes.Multiplayer);
    });

    it('virtual player level choices should appear if solo mode is selected', async () => {
        const gameModeField = component.gameParameters.get('gameMode');
        gameModeField?.setValue(component.gameModes.Solo);

        const levelLabel = fixture.debugElement.nativeElement.querySelector('#level-label');
        const levelButtons = fixture.debugElement.nativeElement.querySelector('#level-buttons');

        expect(levelLabel).toBeTruthy();
        expect(levelButtons).toBeTruthy();
    });

    it('virtual player level choices should not appear if multiplayer mode is selected', async () => {
        const gameModeField = component.gameParameters.get('gameMode');
        gameModeField?.setValue(component.gameModes.Multiplayer);
        fixture.detectChanges();

        const levelLabel = fixture.debugElement.query(By.css('#level-label'));
        const levelButtons = fixture.debugElement.query(By.css('#level-buttons'));

        expect(levelLabel).toBeFalsy();
        expect(levelButtons).toBeFalsy();
    });

    it('form should have the right initial values', async () => {
        const gameParametersForm = component.gameParameters;
        const initialFormValues = {
            gameType: component.gameTypes.Classic,
            gameMode: component.gameModes.Solo,
            level: component.virtualPlayerLevels.Beginner,
            timer: '',
            dict: '',
        };

        expect(gameParametersForm.value).toEqual(initialFormValues);
        expect(component.child.formParameters.get('inputName')?.value).toEqual('');
    });

    // Pensez-vous que he devrais l'enlever celui-là?
    it('form should be invalid if all fields are empty', async () => {
        const gameParametersForm = component.gameParameters;
        const initialFormValues = {
            gameType: '',
            gameMode: '',
            level: '',
            timer: '',
            dict: '',
        };
        gameParametersForm.setValue(initialFormValues);
        component.child.formParameters.get('inputName')?.setValue('');

        expect(component.isFormValid()).toBeFalsy();
    });

    it('form should be invalid if gameType is empty', async () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            gameType: '',
            gameMode: component.gameModes.Solo,
            level: component.virtualPlayerLevels.Beginner,
            timer: '30',
            dict: 'default-dict',
        };
        gameParametersForm.setValue(formValues);
        component.child.formParameters.get('inputName')?.setValue('name');

        expect(component.isFormValid()).toBeFalsy();
    });

    it('form should be invalid if gameMode is empty', async () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            gameType: component.gameTypes.LOG2990,
            gameMode: '',
            level: component.virtualPlayerLevels.Beginner,
            timer: '30',
            dict: 'default-dict',
        };
        gameParametersForm.setValue(formValues);
        component.child.formParameters.get('inputName')?.setValue('name');

        expect(component.isFormValid()).toBeFalsy();
    });

    it('form should be invalid if level is empty while gameMode is solo', async () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            gameType: component.gameTypes.LOG2990,
            gameMode: component.gameModes.Solo,
            level: '',
            timer: '30',
            dict: 'default-dict',
        };
        gameParametersForm.setValue(formValues);
        component.child.formParameters.get('inputName')?.setValue('name');

        expect(component.isFormValid()).toBeFalsy();
    });

    it('form should be valid if level is empty while gameMode is multiplayer', async () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            gameType: component.gameTypes.LOG2990,
            gameMode: component.gameModes.Multiplayer,
            level: '',
            timer: '30',
            dict: 'default-dict',
        };
        gameParametersForm.setValue(formValues);
        component.child.formParameters.get('inputName')?.setValue('name');

        expect(component.isFormValid()).toBeTruthy();
    });

    it('form should not be valid if timer is empty', () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            gameType: component.gameTypes.Classic,
            gameMode: component.gameModes.Solo,
            level: component.virtualPlayerLevels.Beginner,
            timer: '',
            dict: 'default-dict',
        };
        gameParametersForm.setValue(formValues);
        component.child.formParameters.get('inputName')?.setValue('name');

        expect(component.isFormValid()).toBeFalsy();
    });

    it('form should not be valid if dict is empty', () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            gameType: component.gameTypes.Classic,
            gameMode: component.gameModes.Solo,
            level: component.virtualPlayerLevels.Beginner,
            timer: '30',
            dict: '',
        };
        gameParametersForm.setValue(formValues);
        component.child.formParameters.get('inputName')?.setValue('name');

        expect(component.isFormValid()).toBeFalsy();
    });

    it('form should not be valid if name is empty', () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            gameType: component.gameTypes.Classic,
            gameMode: component.gameModes.Solo,
            level: component.virtualPlayerLevels.Beginner,
            timer: '30',
            dict: '',
        };
        gameParametersForm.setValue(formValues);
        component.child.formParameters.get('inputName')?.setValue('name');

        expect(component.isFormValid()).toBeFalsy();
    });

    it('form should be valid if all required fields are filled', () => {
        setValidValues();
        expect(component.isFormValid()).toBeTruthy();
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
        setValidValues();

        const submitButton = fixture.debugElement.nativeElement.querySelector('#create-game-button');
        submitButton.click();

        expect(spy).toHaveBeenCalled();
    });

    it('createGame button should reroute to waiting-room page if form is valid', async () => {
        const location: Location = TestBed.inject(Location);
        setValidValues();

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
