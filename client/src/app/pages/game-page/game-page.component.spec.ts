import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterTestingModule } from '@angular/router/testing';
import { BoardComponent } from '@app/components/board/board.component';
import { CommunicationBoxComponent } from '@app/components/communication-box/communication-box.component';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { InformationBoxComponent } from '@app/components/information-box/information-box.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
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
                TileRackComponent,
                InformationBoxComponent,
                CommunicationBoxComponent,
                BoardComponent,
                DefaultDialogComponent,
            ],
            imports: [MatGridListModule, RouterTestingModule.withRoutes([]), HttpClientModule],
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
});
