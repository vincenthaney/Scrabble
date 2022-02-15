import { Injectable } from '@angular/core';
import { FocusableComponent } from './focusable-component';

@Injectable({
    providedIn: 'root',
})
export class FocusableComponentsService {
    private activeKeyboardComponent?: FocusableComponent<KeyboardEvent> = undefined;

    setActiveKeyboardComponent(component: FocusableComponent<KeyboardEvent>) {
        if (component === this.activeKeyboardComponent) return false;
        this.activeKeyboardComponent?.looseFocusEvent.emit();
        this.activeKeyboardComponent = component;
        return true;
    }

    emitKeyboard(value?: KeyboardEvent) {
        if (!this.activeKeyboardComponent) return false;
        this.activeKeyboardComponent.focusEvent.emit(value);
        return true;
    }
}
