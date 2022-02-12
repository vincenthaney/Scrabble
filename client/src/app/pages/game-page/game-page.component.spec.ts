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
import { GameService } from '@app/services';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';
import SpyObj = jasmine.SpyObj;

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
    let gameServiceSpy: SpyObj<GameService>;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['isLocalPlayerPlaying']);
    });

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
                {
                    provide: GameService,
                    useValue: gameServiceSpy,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open the Surrender dialog when surrender-dialog-button is clicked ', () => {
        // eslint-disable-next-line -- surrenderDialog is private and we need access for the test
        const spy = spyOn(component['surrenderDialog'], 'open');
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
});

@Component({
    template: '',
    selector: 'app-board',
})
export class MockBoardComponent {}

@Component({
    template: '',
    selector: 'app-tile-rack',
})
export class MockTileRackComponent {}

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
