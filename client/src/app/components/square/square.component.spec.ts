/* eslint-disable */
import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { COLORS } from '@app/constants/colors';
import { SQUARE_SIZE, UNDEFINED_SQUARE, UNDEFINED_SQUARE_SIZE } from '@app/constants/game';
import { AppMaterialModule } from '@app/modules/material.module';
import { IconComponent } from '../icon/icon.component';
import { SquareComponent } from './square.component';

describe('SquareComponent', () => {
    let component: SquareComponent;
    let fixture: ComponentFixture<CenterSquareWrapperComponent>;

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
            declarations: [SquareComponent, CenterSquareWrapperComponent, IconComponent],
            providers: [Renderer2],
        }).compileComponents();
    });

    it('should create', () => {
        fixture = TestBed.createComponent(CenterSquareWrapperComponent);
        component = fixture.debugElement.children[0].componentInstance;
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call initializeStyle()', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent();

        spyOn<any>(squareWrapper.squareComponent, 'initializeStyle').and.callFake(() => {
            return;
        });

        squareWrapper.squareComponent.ngOnInit();
        expect(squareWrapper.squareComponent['initializeStyle']).toHaveBeenCalled();
    });

    it('getSquareSize should return UNDEFINED_SQUARE_SIZE if no SquareView is attached', () => {
        const squareWrapper = new SquareTestWrapper();
        spyOnProperty<any>(squareWrapper, 'squareView', 'get').and.returnValue(null);
        squareWrapper.createComponent();

        expect(squareWrapper.squareComponent.getSquareSize()).toEqual(UNDEFINED_SQUARE_SIZE);
    });

    it('getSquareSize should return square_size if SquareView is attached', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent();

        expect(squareWrapper.squareComponent.getSquareSize()).toEqual(squareWrapper.squareView.squareSize);
    });

    it('setText should leave attributes undefined if no SquareView is attached', () => {
        const squareWrapper = new SquareTestWrapper();
        spyOnProperty<any>(squareWrapper, 'squareView', 'get').and.returnValue(undefined);
        squareWrapper.createComponent();

        expect(squareWrapper.squareComponent.multiplierType).toBeUndefined();
        expect(squareWrapper.squareComponent.multiplierValue).toBeUndefined();
    });

    it('constructor should call setText', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent();
        const getTextSpy = spyOn(squareWrapper.squareView, 'getText').and.returnValue([undefined, undefined]);

        squareWrapper.squareComponent.setText();
        
        expect(getTextSpy).toHaveBeenCalled();
    });

    it('initializeStyle should set background-color', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent();
        const expectedColor = COLORS.Blue;

        spyOn(squareWrapper.squareComponent.squareView, 'getColor').and.returnValue(expectedColor);
        squareWrapper.squareComponent['initializeStyle']();

        const actualColor = squareWrapper.squareComponent.style['background-color'];
        expect(actualColor).toEqual(expectedColor);
    });

});

export class SquareTestWrapper {
    pSquareView: SquareView;
    squareComponent: SquareComponent;

    createComponent() {
        this.squareView = new SquareView(UNDEFINED_SQUARE, UNDEFINED_SQUARE_SIZE);
        this.squareComponent = new SquareComponent();
        this.squareComponent.squareView = this.squareView;
    }
    get squareView(): SquareView {
        return this.pSquareView;
    }

    set squareView(squareView: SquareView) {
        this.pSquareView = squareView;
    }
}

@Component({
    selector: 'app-square-component-wrapper',
    template: '<app-square [squareView]="squareView"></app-square>',
})
class CenterSquareWrapperComponent {
    squareView = new SquareView(
        {
            tile: null,
            position: { row: 0, column: 0 },
            multiplier: null,
            wasMultiplierUsed: false,
            isCenter: true,
        },
        SQUARE_SIZE,
    );
}
