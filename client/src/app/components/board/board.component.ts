import { Component } from '@angular/core';
import { SquareComponent } from '@app/components/square/square.component';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
    squares: SquareComponent[][];
}
