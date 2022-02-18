import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAXIMUM_TIMER_VALUE, MINIMUM_TIMER_VALUE, TIMER_VALUE_INCREMENTS } from '@app/constants/pages-constants';

@Component({
    selector: 'app-timer-selection',
    templateUrl: './timer-selection.component.html',
    styleUrls: ['./timer-selection.component.scss'],
})
export class TimerSelectionComponent {
    @Input() parentForm: FormGroup;
    timerValue: number;

    incrementTimerValue(): void {
        this.changeTimerValue(TIMER_VALUE_INCREMENTS);
    }

    decrementTimerValue(): void {
        this.changeTimerValue(-TIMER_VALUE_INCREMENTS);
    }

    changeTimerValue(delta: number): void {
        this.timerValue = Math.min(MAXIMUM_TIMER_VALUE, Math.max(MINIMUM_TIMER_VALUE, this.timerValue + delta));
        this.parentForm.setValue({
            timer: this.timerValue,
        });
    }
}
