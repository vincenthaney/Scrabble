/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SingleHighScore } from '@app/classes/admin/high-score';
import { GameType } from '@app/classes/game-type';
import { HighScoreBoxComponent } from '@app/components/high-score-box/high-score-box.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import HighScoresService from '@app/services/high-scores/high-scores.service';
import { HighScoresComponent } from './high-scores.component';

const DEFAULT_MAP: Map<GameType, SingleHighScore[]> = new Map([
    [GameType.Classic, []],
    [GameType.LOG2990, []],
]);

@Injectable()
export class HighScoresServiceSpy extends HighScoresService {
    // eslint-disable-next-line no-unused-vars
    getHighScores(gameType: GameType): SingleHighScore[] {
        return [];
    }
    handleHighScoresRequest(): void {
        return;
    }
}

describe('HighScoresComponent', () => {
    let component: HighScoresComponent;
    let highScoresServiceMock: HighScoresService;
    let fixture: ComponentFixture<HighScoresComponent>;

    beforeEach(async () => {
        highScoresServiceMock = jasmine.createSpyObj(['getHighScores']);

        await TestBed.configureTestingModule({
            declarations: [HighScoresComponent, HighScoreBoxComponent, PageHeaderComponent, IconComponent],
            imports: [
                MatInputModule,
                MatFormFieldModule,
                MatDividerModule,
                HttpClientTestingModule,
                MatFormFieldModule,
                MatSelectModule,
                MatCardModule,
                BrowserAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                MatButtonToggleModule,
                RouterModule,
                RouterTestingModule,
            ],
            providers: [{ provide: HighScoresService, useClass: HighScoresServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        highScoresServiceMock = TestBed.inject(HighScoresService);
        highScoresServiceMock['highScoresMap'] = DEFAULT_MAP;
        fixture = TestBed.createComponent(HighScoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call handleHighScoresRequest ', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const spyHandleHighScoresRequest = spyOn(highScoresServiceMock, 'handleHighScoresRequest').and.callFake(() => {});
        component.ngOnInit();
        expect(spyHandleHighScoresRequest).toHaveBeenCalled();
    });

    describe('ngOndestroy', () => {
        it('should always call next and complete on ngUnsubscribe', () => {
            const ngUnsubscribeNextSpy = spyOn<any>(component.componentDestroyed$, 'next');
            const ngUnsubscribeCompleteSpy = spyOn<any>(component.componentDestroyed$, 'complete');

            component.ngOnDestroy();
            expect(ngUnsubscribeNextSpy).toHaveBeenCalled();
            expect(ngUnsubscribeCompleteSpy).toHaveBeenCalled();
        });
    });

    it('getHighScores should call getHighScores ', () => {
        const spyGetHighScores = spyOn(highScoresServiceMock, 'getHighScores');
        component.getHighScores();
        expect(spyGetHighScores).toHaveBeenCalled();
    });
});
