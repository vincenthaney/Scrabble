import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
import { Square, SquareView } from '@app/classes/square';
import { UNDEFINED_SQUARE_SIZE } from '@app/constants/game';
import { AppMaterialModule } from '@app/modules/material.module';
import { SquareComponent } from './square.component';

const DEFAULT_SQUARE: Square = {
    tile: null,
    multiplier: null,
    isMultiplierPlayed: false,
    isCenter: false,
};

describe('SquareComponent', () => {
    let component: SquareComponent;
    let fixture: ComponentFixture<SquareTestWrapperComponent>;

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
            declarations: [SquareComponent, SquareTestWrapperComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SquareTestWrapperComponent);
        component = fixture.debugElement.children[0].componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should create', () => {
    //     fixture.whenStable().then(() => {
    //         expect(component.style).toEqual({
    //             'background-color': DEFAULT_SQUARE_COLOR,
    //         });
    //     });
    // });

    // it('getSquareSize should return UNDEFINED_SQUARE_SIZE if SquareView is undefined', () => {
    //     expect(component.getSquareSize()).toEqual(UNDEFINED_SQUARE_SIZE);
    // });

    // it('getSquareSize should return square size of associated SquareView', () => {
    //     const squareSize = { x: 1, y: 1 };
    //     const squareView: SquareView = new SquareView(null, squareSize);
    //     component.squareView = squareView;
    //     expect(component.getSquareSize()).toEqual(squareView.squareSize);
    // });
});

@Component({
    selector: 'app-square-component-test-wrapper',
    template: '<app-square [squareView]="squareView"></app-square>',
})
class SquareTestWrapperComponent {
    squareView: SquareView = new SquareView(DEFAULT_SQUARE, UNDEFINED_SQUARE_SIZE);
}
