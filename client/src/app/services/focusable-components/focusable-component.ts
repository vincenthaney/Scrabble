import { EventEmitter } from '@angular/core';

export abstract class FocusableComponent<T> {
    focusEvent: EventEmitter<T> = new EventEmitter();
    looseFocusEvent: EventEmitter<void> = new EventEmitter();
}
