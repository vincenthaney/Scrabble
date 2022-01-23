import { Injectable } from '@angular/core';
import { Board } from '@app/classes/board';

@Injectable({
    providedIn: 'root',
})
export default class ScoreComputerService {
    board: Board;
}
