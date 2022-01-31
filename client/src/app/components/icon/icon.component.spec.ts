import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconComponent } from './icon.component';
import { IconAnimation, IconName, IconRotation, IconSize, IconStyle } from './icon.component.type';

describe('IconComponent', () => {
    let component: IconComponent;
    let fixture: ComponentFixture<IconComponent>;
    let i: HTMLElement;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [IconComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IconComponent);
        component = fixture.componentInstance;
        i = fixture.nativeElement.querySelector('i');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add icon name class', () => {
        const name: IconName = 'user';
        component.icon = name;
        fixture.detectChanges();
        expect(i.classList).toContain(`fa-${name}`);
    });

    it('should have prefix', () => {
        const styling: IconStyle = 'light';
        const prefix = component.getPrefix(styling);
        component.styling = styling;
        fixture.detectChanges();
        expect(i.classList).toContain(prefix);
    });

    it('should add animation when have one', () => {
        const animation: IconAnimation = 'pulse';
        component.animation = animation;
        fixture.detectChanges();
        expect(i.classList).toContain(`fa-${animation}`);
    });

    it('should add size when have one', () => {
        const size: IconSize = '10x';
        component.size = size;
        fixture.detectChanges();
        expect(i.classList).toContain(`fa-${size}`);
    });

    it('should add rotation when have one', () => {
        const rotation: IconRotation = 'flip-horizontal';
        component.rotation = rotation;
        fixture.detectChanges();
        expect(i.classList).toContain(`fa-${rotation}`);
    });
});
