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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
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
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';
// import SpyObj = jasmine.SpyObj;

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
                RouterTestingModule.withRoutes([]),
            ],
            providers: [
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
                },
                // {
                //     provide: GameService,
                //     useValue: gameServiceSpy,
                // },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameServiceMock = TestBed.inject(GameService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call disconnectGame if player left abnormally', () => {
        component.playerLeftWithQuitButton = false;
        const spyDiconnect = spyOn(gameServiceMock, 'disconnectGame');
        component.ngOnDestroy();
        expect(spyDiconnect).toHaveBeenCalled();
    });

    it('should not call disconnectGame if player left normally', () => {
        component.playerLeftWithQuitButton = true;
        const spyDiconnect = spyOn(gameServiceMock, 'disconnectGame');
        component.ngOnDestroy();
        expect(spyDiconnect).not.toHaveBeenCalled();
    });

    it('should open the Surrender dialog when surrender-dialog-button is clicked ', () => {
        // eslint-disable-next-line -- surrenderDialog is private and we need access for the test
        const spy = spyOn(component['dialog'], 'open');
        const surrenderButton = fixture.debugElement.nativeElement.querySelector('#surrender-dialog-button');
        surrenderButton.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should call emitKeyboard on keyboardEvent', () => {
        const event: KeyboardEvent = new KeyboardEvent('keypress', {
            key: '.',
            cancelable: true,
        });
        const spy = spyOn(component['focusableComponentService'], 'emitKeyboard');
        component.handleKeyboardEvent(event);
        expect(spy).toHaveBeenCalledWith(event);
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

    describe('changeTileFontSize', () => {
        beforeEach(() => {
            component.tileRackComponent = jasmine.createSpyObj('MockTileRackComponent', ['tileFontSize']);
            component.boardComponent = jasmine.createSpyObj('MockBoardComponent', ['tileFontSize']);
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

    it('Clicking on quit button when the game is over should show quitting dialog', () => {
        gameServiceMock.isGameOver = true;
        const spy = spyOn(component, 'openDialog').and.callFake(() => {
            return;
        });
        const buttonsContent = [DIALOG_QUIT_BUTTON_CONFIRM, DIALOG_QUIT_STAY];

        component.quitButtonClicked();
        expect(spy).toHaveBeenCalledOnceWith(DIALOG_QUIT_TITLE, DIALOG_QUIT_CONTENT, buttonsContent);
    });

    it('handlePlayerLeave should tell the playerLeavesService', () => {
        const leaveSpy = spyOn(component['playerLeavesService'], 'handleLocalPlayerLeavesGame').and.callFake(() => {
            return;
        });
        expect(component.playerLeftWithQuitButton).toBeFalse();
        component['handlePlayerLeave']();
        expect(component.playerLeftWithQuitButton).toBeTrue();
        expect(leaveSpy).toHaveBeenCalled();
    });
});
