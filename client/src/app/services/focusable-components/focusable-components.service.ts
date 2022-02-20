import { Injectable } from '@angular/core';
import { FocusableComponent } from './focusable-component';

@Injectable({
    providedIn: 'root',
})
export class FocusableComponentsService {
    private activeKeyboardComponent?: FocusableComponent<KeyboardEvent> = undefined;

    setActiveKeyboardComponent(component: FocusableComponent<KeyboardEvent>): boolean {
        if (component === this.activeKeyboardComponent) return false;
        this.activeKeyboardComponent?.emitLooseFocusEvent();
        this.activeKeyboardComponent = component;
        return true;
    }

    emitKeyboard(value: KeyboardEvent): boolean {
        if (!this.activeKeyboardComponent) return false;
        this.activeKeyboardComponent.emitFocusableEvent(value);
        return true;
    }
}
