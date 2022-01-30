import { CommonModule } from '@angular/common';
import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SquareView } from '@app/classes/square';
import { UNDEFINED_SQUARE, UNDEFINED_SQUARE_SIZE, UNDEFINED_TILE } from '@app/constants/game';
import { AppMaterialModule } from '@app/modules/material.module';
import { SquareComponent } from './square.component';
import SpyObj = jasmine.SpyObj;

describe('SquareComponent', () => {
    let rendererSpy: SpyObj<Renderer2>;
    // let component: SquareComponent;
    // let fixture: ComponentFixture<SquareComponent>;

    beforeEach(async () => {
        rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setStyle']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatGridListModule,
                MatCardModule,
                MatProgressSpinnerModule,
                MatIconModule,
                MatButtonModule,
                ReactiveFormsModule,
                CommonModule,
                MatInputModule,
                BrowserAnimationsModule,
                AppMaterialModule,
                MatFormFieldModule,
                FormsModule,
                MatDialogModule,
            ],
            declarations: [SquareComponent],
            providers: [{ provide: Renderer2, useValue: rendererSpy }],
        }).compileComponents();
    });

    it('ngOnInit should call initializeStyle()', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(squareWrapper.squareComponent, 'initializeStyle');

        squareWrapper.squareComponent.ngOnInit();
        // eslint-disable-next-line dot-notation
        expect(squareWrapper.squareComponent['initializeStyle']).toHaveBeenCalled();
    });

    it('ngAfterViewInit should call initializeStarClasses()', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(squareWrapper.squareComponent, 'initializeStarClasses');

        squareWrapper.squareComponent.ngAfterViewInit();
        // eslint-disable-next-line dot-notation
        expect(squareWrapper.squareComponent['initializeStarClasses']).toHaveBeenCalled();
    });

    it('getSquareSize should return UNDEFINED_SQUARE_SIZE if no SquareView is attached', () => {
        const squareWrapper = new SquareTestWrapper();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOnProperty<any>(squareWrapper, 'squareView', 'get').and.returnValue(null);
        squareWrapper.createComponent(rendererSpy);

        expect(squareWrapper.squareComponent.getSquareSize()).toEqual(UNDEFINED_SQUARE_SIZE);
    });

    it('getSquareSize should return square_size if SquareView is attached', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);

        expect(squareWrapper.squareComponent.getSquareSize()).toEqual(squareWrapper.squareView.squareSize);
    });

    it('getText should return UNDEFINED_TILE.letter if no SquareView is attached', () => {
        const squareWrapper = new SquareTestWrapper();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOnProperty<any>(squareWrapper, 'squareView', 'get').and.returnValue(null);
        squareWrapper.createComponent(rendererSpy);

        expect(squareWrapper.squareComponent.getText()).toBe(UNDEFINED_TILE.letter);
    });

    it('getText should call squareView.getText()', () => {
        const testText = 'Test';
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);
        const getTextSpy = spyOn(squareWrapper.squareComponent, 'getText').and.callFake(() => {
            return testText;
        });
        expect(squareWrapper.squareComponent.getText()).toEqual(testText);
        expect(getTextSpy).toHaveBeenCalled();
    });

    it('getText should return value of squareView.getText()', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);
        expect(squareWrapper.squareComponent.getText()).toEqual(squareWrapper.squareView.getText());
    });
});

class SquareTestWrapper {
    pSquareView: SquareView;
    squareComponent: SquareComponent;

    createComponent(renderer: Renderer2) {
        this.squareView = new SquareView(UNDEFINED_SQUARE, UNDEFINED_SQUARE_SIZE);
        this.squareComponent = new SquareComponent(renderer);
        this.squareComponent.squareView = this.squareView;
    }
    get squareView(): SquareView {
        return this.pSquareView;
    }

    set squareView(squareView: SquareView) {
        this.pSquareView = squareView;
    }
}
