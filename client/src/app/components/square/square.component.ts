import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { SquareView } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';
import { UNDEFINED_SQUARE_SIZE, UNDEFINED_TILE } from '@app/constants/game';

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent implements OnInit, AfterViewInit {
    private static readonly starElementClasses: string[] = ['fa', 'fa-solid', 'fa-star'];
    private static readonly starStyle: { [key: string]: string } = { 'font-size': '40px' };
    private static readonly starDivStyle: { [key: string]: string } = {
        // eslint-disable-next-line quote-props
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
    };

    @Input() squareView: SquareView;
    @ViewChild('squareButton', { static: false, read: ElementRef }) private button: ElementRef<HTMLButtonElement>;
    style: { [key: string]: string } = {};

    constructor(private renderer: Renderer2) {}
    ngOnInit() {
        this.initializeStyle();
    }

    ngAfterViewInit() {
        this.initializeStarClasses();
    }

    getSquareSize(): Vec2 {
        if (!this.squareView) {
            return UNDEFINED_SQUARE_SIZE;
        }
        return this.squareView.squareSize;
    }

    getText(): string {
        if (!this.squareView) {
            return UNDEFINED_TILE.letter;
        }
        return this.squareView.getText();
    }

    private initializeStyle() {
        this.style = {
            'background-color': this.squareView.getColor(),
        };
    }

    private initializeStarClasses() {
        if (!this.squareView.square.isCenter) return;
        const textWrapper = this.button.nativeElement.getElementsByClassName('mat-button-wrapper')[0];
        const starDiv = this.renderer.createElement('div');
        const starElement = this.renderer.createElement('i');

        this.applyStarStyleAndClasses(starDiv, starElement);

        starDiv.appendChild(starElement);
        textWrapper.appendChild(starDiv);
    }

    private applyStarStyleAndClasses(starDiv: HTMLElement, starElement: HTMLElement) {
        Object.keys(SquareComponent.starDivStyle).forEach((key) => this.renderer.setStyle(starDiv, key, SquareComponent.starDivStyle[key]));
        Object.keys(SquareComponent.starStyle).forEach((key) => this.renderer.setStyle(starElement, key, SquareComponent.starStyle[key]));
        SquareComponent.starElementClasses.forEach((c) => starElement.classList.add(c));
    }
}
