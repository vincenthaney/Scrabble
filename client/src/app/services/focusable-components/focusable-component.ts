/* eslint-disable no-redeclare */
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface FocusableComponent<T> {
    onLooseFocusEvent?(): void;
    onFocusableEvent?(value: T): void;
}

export abstract class FocusableComponent<T> {
    private focusableEvent: Subject<T> = new Subject();
    private looseFocusEvent: Subject<void> = new Subject();
    private focusableComponentDestroyed$: Subject<boolean> = new Subject();

    emitFocusableEvent(value: T) {
        this.focusableEvent.next(value);
    }

    emitLooseFocusEvent() {
        this.looseFocusEvent.next();
    }

    protected subscribeToFocusableEvent(destroy$: Subject<boolean>, next: (value: T) => void) {
        this.focusableEvent.pipe(takeUntil(destroy$)).subscribe(next);
    }

    protected subscribeToLooseFocusEvent(destroy$: Subject<boolean>, next: () => void) {
        this.looseFocusEvent.pipe(takeUntil(destroy$)).subscribe(next);
    }

    protected subscribe(): void {
        this.focusableEvent.pipe(takeUntil(this.focusableComponentDestroyed$)).subscribe(this.onFocusableEvent);
        this.looseFocusEvent.pipe(takeUntil(this.focusableComponentDestroyed$)).subscribe(this.onLooseFocusEvent);
    }

    protected destroy(): void {
        this.focusableComponentDestroyed$.next(true);
        this.focusableComponentDestroyed$.complete();
    }
}
