/* eslint-disable no-redeclare */
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export abstract class FocusableComponent<T> {
    private focusableEvent: Subject<T> = new Subject();
    private loseFocusEvent: Subject<void> = new Subject();
    private focusableComponentDestroyed$: Subject<boolean> = new Subject();

    emitFocusableEvent(value: T) {
        this.focusableEvent.next(value);
    }

    emitLoseFocusEvent() {
        this.loseFocusEvent.next();
    }

    protected onLoseFocusEvent?(): void;
    protected onFocusableEvent?(value: T): void;

    protected subscribeToFocusableEvent(destroy$: Subject<boolean>, next: (value: T) => void) {
        this.focusableEvent.pipe(takeUntil(destroy$)).subscribe(next);
    }

    protected subscribeToLoseFocusEvent(destroy$: Subject<boolean>, next: () => void) {
        this.loseFocusEvent.pipe(takeUntil(destroy$)).subscribe(next);
    }

    protected subscribe(): void {
        this.focusableEvent.pipe(takeUntil(this.focusableComponentDestroyed$)).subscribe(this.onFocusableEvent?.bind(this));
        this.loseFocusEvent.pipe(takeUntil(this.focusableComponentDestroyed$)).subscribe(this.onLoseFocusEvent?.bind(this));
    }

    protected destroy(): void {
        this.focusableComponentDestroyed$.next(true);
        this.focusableComponentDestroyed$.complete();
    }
}
