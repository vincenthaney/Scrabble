/* eslint-disable dot-notation */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonToggleGroupHarness, MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameMode } from '@app/classes/game-mode';
import { IconComponent } from '@app/components/icon/icon.component';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { TimerSelectionComponent } from '@app/components/timer-selection/timer-selection.component';
import { DEFAULT_PLAYER } from '@app/constants/game';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameDispatcherService } from '@app/services/';
import { GameCreationPageComponent } from './game-creation-page.component';

@Component({
    template: '',
})
class TestComponent {}

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let loader: HarnessLoader;
    let gameParameters: FormGroup;
    let gameDispatcherServiceMock: GameDispatcherService;
    let handleGameCreationSpy: jasmine.Spy;
    const EMPTY_VALUE = '';

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCreationPageComponent, NameFieldComponent, TestComponent, TimerSelectionComponent, IconComponent, PageHeaderComponent],
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
                RouterTestingModule.withRoutes([
                    { path: 'waiting-room', component: TestComponent },
                    { path: 'home', component: TestComponent },
                    { path: 'game-creation', component: GameCreationPageComponent },
                    { path: 'game', component: TestComponent },
                ]),
            ],
            providers: [MatButtonToggleHarness, MatButtonHarness, MatButtonToggleGroupHarness, GameDispatcherService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCreationPageComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        gameDispatcherServiceMock = TestBed.inject(GameDispatcherService);
        gameParameters = component.gameParameters;
        fixture.detectChanges();

        handleGameCreationSpy = spyOn(gameDispatcherServiceMock, 'handleCreateGame');
    });

    const setValidFormValues = () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            gameType: component.gameTypes.LOG2990,
            gameMode: component.gameModes.Solo,
            virtualPlayerName: DEFAULT_PLAYER.name,
            level: component.virtualPlayerLevels.Beginner,
            timer: '60',
            dictionary: 'français',
        };
        gameParametersForm.setValue(formValues);
        component.playerName = 'valid name';
        component.playerNameValid = true;
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should add validator required to level if game mode is Solo', () => {
            const spy = spyOn<any>(component.gameParameters.get('level'), 'setValidators');
            component.ngOnInit();
            component.gameParameters.get('gameMode')?.setValue(GameMode.Solo);
            expect(spy).toHaveBeenCalledWith([Validators.required]);
        });

        it('should remove validator required to level if game mode is not Solo', () => {
            const spy = spyOn<any>(component.gameParameters.get('level'), 'clearValidators');
            component.ngOnInit();
            component.gameParameters.get('gameMode')?.setValue(GameMode.Multiplayer);
            expect(spy).toHaveBeenCalled();
        });

        it('should always call updateValueAndValidity to level', () => {
            const spy = spyOn<any>(component.gameParameters.get('level'), 'updateValueAndValidity');
            component.ngOnInit();
            component.gameParameters.get('gameMode')?.setValue(undefined);
            expect(spy).toHaveBeenCalled();
        });

        it('ngOnInit should subscribe to RoundManager endRoundEvent', () => {
            const subscribeSpy = spyOn<any>(component.gameParameters.get('gameMode')?.valueChanges, 'subscribe');
            component.ngOnInit();
            expect(subscribeSpy).toHaveBeenCalled();
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
    });

    describe('isFormValid', () => {
        it('form should be valid if all required fields are filled', () => {
            setValidFormValues();
            expect(component.isFormValid()).toBeTrue();
        });

        it('form should be invalid if gameType is empty', async () => {
            setValidFormValues();
            gameParameters.get('gameType')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeFalse();
        });

        it('form should be invalid if gameMode is empty', async () => {
            setValidFormValues();
            gameParameters.get('gameMode')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeFalse();
        });

        it('form should be invalid if level is empty while gameMode is solo', async () => {
            setValidFormValues();
            gameParameters.get('level')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeFalse();
        });

        it('form should be valid if level is empty while gameMode is multiplayer', async () => {
            setValidFormValues();
            gameParameters.get('gameMode')?.setValue(component.gameModes.Multiplayer);
            gameParameters.get('level')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeTrue();
        });

        it('form should not be valid if timer is empty', () => {
            setValidFormValues();
            gameParameters.get('timer')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeFalse();
        });

        it('form should not be valid if dictionary is empty', () => {
            setValidFormValues();
            gameParameters.get('dictionary')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeFalse();
        });

        it('form should not be valid if name is empty', () => {
            setValidFormValues();

            component.playerName = EMPTY_VALUE;
            component.playerNameValid = false;

            expect(component.isFormValid()).toBeFalse();
        });
    });

    describe('onSubmit', () => {
        it('clicking createGame button should call onSubmit', async () => {
            spyOn(component, 'isFormValid').and.returnValue(true);
            fixture.detectChanges();
            const createButton = fixture.debugElement.nativeElement.querySelector('#create-game-button');
            const spy = spyOn(component, 'onSubmit').and.callFake(() => {
                return;
            });
            createButton.click();

            expect(spy).toHaveBeenCalled();
        });

        it('form should call createGame on submit if form is valid', async () => {
            const spy = spyOn(component, 'createGame');
            spyOn(component, 'isFormValid').and.returnValue(true);

            component.onSubmit();
            expect(spy).toHaveBeenCalled();
        });

        it('should NOT call createGame on submit if form is invalid', async () => {
            const spy = spyOn(component, 'createGame');
            spyOn(component, 'isFormValid').and.returnValue(false);

            component.onSubmit();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('createGame', () => {
        it('createGame should reroute to waiting-room if multiplayer game', () => {
            const spy = spyOn<any>(component['router'], 'navigateByUrl');
            component.gameParameters.patchValue({ gameMode: component.gameModes.Multiplayer });

            component.createGame();
            expect(spy).toHaveBeenCalledWith('waiting-room');
        });

        it('createGame should NOT reroute to game if solo game', () => {
            const spy = spyOn<any>(component['router'], 'navigateByUrl');
            component.gameParameters.patchValue({ gameMode: component.gameModes.Solo });
            component.createGame();
            expect(spy).not.toHaveBeenCalledWith('game');
        });

        it('createGame button should always call gameDispatcher.handleCreateGame', () => {
            component.createGame();
            expect(handleGameCreationSpy).toHaveBeenCalled();
        });
    });

    describe('onPlayerNameChanges', () => {
        it('should set playerName and playerNameCalid', () => {
            component.playerName = EMPTY_VALUE;
            (component.playerNameValid as unknown) = EMPTY_VALUE;

            const expectedName = 'player name';
            const expectedValid = true;

            component.onPlayerNameChanges([expectedName, expectedValid]);

            expect(component.playerName).toEqual(expectedName);
            expect(component.playerNameValid).toEqual(expectedValid);
        });
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

        if (await soloButton.isDisabled()) return;
        await soloButton.toggle();
        expect(gameModeField?.value).toEqual(component.gameModes.Solo);
    });

    it('clicking on Multiplayer button should set gameMode attribute to Multiplayer', async () => {
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
        fixture.detectChanges();

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
});
