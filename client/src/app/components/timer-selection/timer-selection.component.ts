import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MAXIMUM_TIMER_VALUE, MINIMUM_TIMER_VALUE } from '@app/constants/pages-constants';

@Component({
    selector: 'app-timer-selection',
    templateUrl: './timer-selection.component.html',
    styleUrls: ['./timer-selection.component.scss'],
})
export class TimerSelectionComponent {
    @Input() timerValue: number;
    @Output() timerChangeEvent: EventEmitter<number> = new EventEmitter();

    changeTimerValue(delta: number): void {
        this.timerValue = Math.min(MAXIMUM_TIMER_VALUE, Math.max(MINIMUM_TIMER_VALUE, this.timerValue + delta));
        this.timerChangeEvent.emit(this.timerValue);
    }
}
