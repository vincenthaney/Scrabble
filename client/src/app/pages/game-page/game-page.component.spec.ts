/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionData, ActionType, PlaceActionPayload } from '@app/classes/actions/action-data';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { ARROW_LEFT, ARROW_RIGHT, BACKSPACE, ESCAPE } from '@app/constants/components-constants';
import { DEFAULT_PLAYER } from '@app/constants/game';
import { DIALOG_QUIT_BUTTON_CONFIRM, DIALOG_QUIT_CONTENT, DIALOG_QUIT_STAY, DIALOG_QUIT_TITLE } from '@app/constants/pages-constants';
import {
    RACK_FONT_SIZE_INCREMENT,
    RACK_TILE_DEFAULT_FONT_SIZE,
    RACK_TILE_MAX_FONT_SIZE,
    RACK_TILE_MIN_FONT_SIZE,
    SQUARE_FONT_SIZE_INCREMENT,
    SQUARE_TILE_DEFAULT_FONT_SIZE,
    SQUARE_TILE_MAX_FONT_SIZE,
    SQUARE_TILE_MIN_FONT_SIZE,
} from '@app/constants/tile-font-size';
import { GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';

@Component({
    template: '',
    selector: 'app-board',
})
export class MockBoardComponent {
    tileFontSize = SQUARE_TILE_DEFAULT_FONT_SIZE;
}

@Component({
    template: '',
    selector: 'app-tile-rack',
})
export class MockTileRackComponent {
    tileFontSize = RACK_TILE_DEFAULT_FONT_SIZE;
}

@Component({
    template: '',
    selector: 'app-information-box',
})
export class MockInformationBoxComponent {}

@Component({
    template: '',
    selector: 'app-communication-box',
})
export class MockCommunicationBoxComponent {}

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

export class RoundManagerServiceMock {
    getActivePlayer() {
        return DEFAULT_PLAYER;
    }
}

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameServiceMock: GameService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                GamePageComponent,
                TileComponent,
                DefaultDialogComponent,
                IconComponent,
                MockBoardComponent,
                MockCommunicationBoxComponent,
                MockInformationBoxComponent,
                MockTileRackComponent,
            ],
            imports: [
                MatGridListModule,
                MatCardModule,
                MatExpansionModule,
                BrowserAnimationsModule,
                ReactiveFormsModule,
                FormsModule,
                ScrollingModule,
                HttpClientTestingModule,
                MatTooltipModule,
                RouterTestingModule.withRoutes([]),
            ],
            providers: [
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
                },
                {
                    provide: RoundManagerService,
                    useClass: RoundManagerServiceMock,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameServiceMock = TestBed.inject(GameService);
        component['mustDisconnectGameOnLeave'] = false;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call disconnectGame if player left with quit button or no active game dialog)', () => {
        component.mustDisconnectGameOnLeave = false;
        const spyDiconnect = spyOn(component['reconnectionService'], 'disconnectGame').and.callFake(() => {
            return;
        });
        component.ngOnDestroy();
        expect(spyDiconnect).not.toHaveBeenCalled();
    });

    it('should not call disconnectGame if player left abnormally during game', () => {
        component.mustDisconnectGameOnLeave = true;
        const spyDiconnect = spyOn(component['reconnectionService'], 'disconnectGame').and.callFake(() => {
            return;
        });
        component.ngOnDestroy();
        expect(spyDiconnect).toHaveBeenCalled();
        component.mustDisconnectGameOnLeave = false;
    });

    it('should open the Surrender dialog when surrender-dialog-button is clicked ', () => {
        // eslint-disable-next-line -- surrenderDialog is private and we need access for the test
        const spy = spyOn(component['dialog'], 'open');
        const surrenderButton = fixture.debugElement.nativeElement.querySelector('#surrender-dialog-button');
        surrenderButton.click();
        expect(spy).toHaveBeenCalled();
    });

    describe('keypress/keydown', () => {
        const tests: [method: keyof GamePageComponent, key: string][] = [
            ['handleKeyboardEvent', 'a'],
            ['handleKeyboardEventEsc', ESCAPE],
            ['handleKeyboardEventBackspace', BACKSPACE],
            ['handleKeyboardEventArrowLeft', ARROW_LEFT],
            ['handleKeyboardEventArrowRight', ARROW_RIGHT],
        ];
        let emitKeyboardSpy: jasmine.Spy;

        beforeEach(() => {
            emitKeyboardSpy = spyOn(component['focusableComponentService'], 'emitKeyboard');
        });

        for (const [method, key] of tests) {
            it(`should call emitKeyboard on ${method}`, () => {
                const event: KeyboardEvent = new KeyboardEvent('keypress', {
                    key,
                    cancelable: true,
                });

                (component[method] as (e: unknown) => void)(event);
                expect(emitKeyboardSpy).toHaveBeenCalledWith(event);
            });
        }
    });

    describe('passButtonClicked', () => {
        const fakeData = { fake: 'data' };
        let createActionDataSpy: jasmine.Spy;
        let sendAction: jasmine.Spy;

        it('should use action service to pass', () => {
            spyOn(component['gameService'], 'getGameId').and.returnValue('gameId');
            spyOn(component['gameService'], 'getLocalPlayerId').and.returnValue('playerId');

            createActionDataSpy = spyOn(component['actionService'], 'createActionData').and.returnValue(fakeData as unknown as ActionData);
            sendAction = spyOn(component['actionService'], 'sendAction').and.callFake(() => {
                return;
            });
            component.passButtonClicked();
            expect(createActionDataSpy).toHaveBeenCalledWith(ActionType.PASS, {});
            expect(sendAction).toHaveBeenCalledWith('gameId', 'playerId', fakeData);
        });
    });

    describe('placeButtonClicked', () => {
        let getPayloadSpy: jasmine.Spy;
        const fakeData = { fake: 'data' };
        let createActionDataSpy: jasmine.Spy;
        let sendAction: jasmine.Spy;

        beforeEach(() => {
            getPayloadSpy = spyOn(component['gameViewEventManagerService'], 'getGameViewEventValue');
            spyOn(component['gameService'], 'getGameId').and.returnValue('gameId');
            spyOn(component['gameService'], 'getLocalPlayerId').and.returnValue('playerId');

            createActionDataSpy = spyOn(component['actionService'], 'createActionData').and.returnValue(fakeData as unknown as ActionData);
            sendAction = spyOn(component['actionService'], 'sendAction').and.callFake(() => {
                return;
            });
        });

        it('should sendAction through ActionService', () => {
            const payload: PlaceActionPayload = {} as PlaceActionPayload;
            getPayloadSpy.and.returnValue(payload);

            component.placeButtonClicked();

            expect(createActionDataSpy).toHaveBeenCalledWith(ActionType.PLACE, payload);
            expect(sendAction).toHaveBeenCalledOnceWith('gameId', 'playerId', fakeData);
        });

        it('should not call sendPlaceAction if no payload', () => {
            getPayloadSpy.and.returnValue(undefined);

            component.placeButtonClicked();

            expect(sendAction).not.toHaveBeenCalled();
        });
    });

    describe('changeTileFontSize', () => {
        beforeEach(() => {
            component.tileRackComponent = jasmine.createSpyObj('MockTileRackComponent', ['tileFontSize']);
            component.boardComponent = jasmine.createSpyObj('MockBoardComponent', ['tileFontSize']);
        });

        it('should call changeTileFontSize with smaller when - button is clicked ', () => {
            const spy = spyOn(component, 'changeTileFontSize');
            const minusButton = fixture.debugElement.nativeElement.querySelector('#minus-button');
            minusButton.click();
            expect(spy).toHaveBeenCalledWith('smaller');
        });

        it('should call changeTileFontSize with larger when + button is clicked ', () => {
            const spy = spyOn(component, 'changeTileFontSize');
            const minusButton = fixture.debugElement.nativeElement.querySelector('#plus-button');
            minusButton.click();
            expect(spy).toHaveBeenCalledWith('larger');
        });

        it('should increment tileFontSize of tilerack and board components if max size not reached', () => {
            component.tileRackComponent.tileFontSize = RACK_TILE_DEFAULT_FONT_SIZE;
            component.boardComponent.tileFontSize = SQUARE_TILE_DEFAULT_FONT_SIZE;
            component.changeTileFontSize('larger');
            expect(component.tileRackComponent.tileFontSize).toEqual(RACK_TILE_DEFAULT_FONT_SIZE + RACK_FONT_SIZE_INCREMENT);
            expect(component.boardComponent.tileFontSize).toEqual(SQUARE_TILE_DEFAULT_FONT_SIZE + SQUARE_FONT_SIZE_INCREMENT);
        });

        it('should NOT increment tileFontSize of tilerack and board components if max size already reached', () => {
            component.tileRackComponent.tileFontSize = RACK_TILE_MAX_FONT_SIZE;
            component.boardComponent.tileFontSize = SQUARE_TILE_MAX_FONT_SIZE;
            component.changeTileFontSize('larger');
            expect(component.tileRackComponent.tileFontSize).toEqual(RACK_TILE_MAX_FONT_SIZE);
            expect(component.boardComponent.tileFontSize).toEqual(SQUARE_TILE_MAX_FONT_SIZE);
        });

        it('should decrement tileFontSize of tilerack and board components if min size not reached', () => {
            component.tileRackComponent.tileFontSize = RACK_TILE_DEFAULT_FONT_SIZE;
            component.boardComponent.tileFontSize = SQUARE_TILE_DEFAULT_FONT_SIZE;
            component.changeTileFontSize('smaller');
            expect(component.tileRackComponent.tileFontSize).toEqual(RACK_TILE_DEFAULT_FONT_SIZE - RACK_FONT_SIZE_INCREMENT);
            expect(component.boardComponent.tileFontSize).toEqual(SQUARE_TILE_DEFAULT_FONT_SIZE - SQUARE_FONT_SIZE_INCREMENT);
        });

        it('should NOT decrement tileFontSize of tilerack and board components if min size already reached', () => {
            component.tileRackComponent.tileFontSize = RACK_TILE_MIN_FONT_SIZE;
            component.boardComponent.tileFontSize = SQUARE_TILE_MIN_FONT_SIZE;
            component.changeTileFontSize('smaller');
            expect(component.tileRackComponent.tileFontSize).toEqual(RACK_TILE_MIN_FONT_SIZE);
            expect(component.boardComponent.tileFontSize).toEqual(SQUARE_TILE_MIN_FONT_SIZE);
        });
    });

    describe('canPass', () => {
        it('should not be able to pass if its not the player turn', () => {
            spyOn(component, 'isLocalPlayerTurn').and.returnValue(false);
            expect(component.canPass()).toBeFalse();
        });

        it('should not be able to pass if the game is over', () => {
            component['gameService'].isGameOver = true;
            expect(component.canPass()).toBeFalse();
            component['gameService'].isGameOver = false;
        });

        it('should not be able to pass if action has been played', () => {
            component['actionService'].hasActionBeenPlayed = true;
            expect(component.canPass()).toBeFalse();
            component['actionService'].hasActionBeenPlayed = false;
        });

        it('should be able to pass if the conditions are met', () => {
            spyOn(component, 'isLocalPlayerTurn').and.returnValue(true);
            component['gameService'].isGameOver = false;
            component['actionService'].hasActionBeenPlayed = false;
            expect(component.canPass()).toBeTrue();
        });
    });

    describe('canPlaceWord', () => {
        let getPayloadSpy: jasmine.Spy;

        beforeEach(() => {
            getPayloadSpy = spyOn(component['gameViewEventManagerService'], 'getGameViewEventValue');
        });

        it('should not be able to place word if pass conditions are not met', () => {
            spyOn(component, 'canPass').and.returnValue(false);
            expect(component.canPlaceWord()).toBeFalse();
        });

        it('should not be able to place word if there are no tiles played', () => {
            spyOn(component, 'canPass').and.returnValue(true);
            getPayloadSpy.and.returnValue(undefined);
            expect(component.canPlaceWord()).toBeFalse();
        });

        it('should be able to pass if the conditions are met', () => {
            spyOn(component, 'canPass').and.returnValue(true);
            const payload: PlaceActionPayload = {} as PlaceActionPayload;
            getPayloadSpy.and.returnValue(payload);

            expect(component.canPlaceWord()).toBeTrue();
        });
    });

    it('Clicking on quit button when the game is over should show quitting dialog', () => {
        gameServiceMock.isGameOver = true;
        const spy = spyOn(component, 'openDialog').and.callFake(() => {
            return;
        });
        const buttonsContent = [DIALOG_QUIT_BUTTON_CONFIRM, DIALOG_QUIT_STAY];

        component.quitButtonClicked();
        expect(spy).toHaveBeenCalledOnceWith(DIALOG_QUIT_TITLE, DIALOG_QUIT_CONTENT, buttonsContent);
    });

    it('handlePlayerLeave should notify the playerLeavesService', () => {
        component['mustDisconnectGameOnLeave'] = true;
        const leaveSpy = spyOn(component['playerLeavesService'], 'handleLocalPlayerLeavesGame').and.callFake(() => {
            return;
        });
        component['handlePlayerLeaves']();
        expect(component.mustDisconnectGameOnLeave).toBeFalse();
        expect(leaveSpy).toHaveBeenCalled();
    });
});
