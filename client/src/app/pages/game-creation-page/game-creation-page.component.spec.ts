import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonToggleGroupHarness, MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameCreationPageComponent } from './game-creation-page.component';

@Component({
  template: ''
})
class TestComponent {
}

//let loader: HarnessLoader;

describe('GameCreationPageComponent', () => {
  let component: GameCreationPageComponent;
  let fixture: ComponentFixture<GameCreationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameCreationPageComponent, TestComponent ],
      imports: [
        AppMaterialModule,
        BrowserAnimationsModule,
        FormsModule, 
        ReactiveFormsModule,
        CommonModule, 
        MatButtonToggleModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        RouterTestingModule.withRoutes([
          { path: 'waiting-room', component: TestComponent },
          { path: 'home', component: TestComponent }
      ])],
      providers: [
        MatButtonToggleHarness,
        MatButtonHarness,
        MatButtonToggleGroupHarness
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameCreationPageComponent);
    //loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //TODO : finish tests

  // it('clicking on LOG2990 button should set gameType attribute to LOG2990', async () => {
  //   component.gameType = component.GameType.Classic;
  //   const log2990Button = await loader.getHarness(MatButtonToggleGroupHarness.with({
  //     selector: '#first'
  //   }));
  //   console.log("truc: " + await log2990Button.getAppearance());
  //   console.log('value: ' + component.gameType);
  //   console.log("truc: " + await log2990Button.isVertical());
  //   console.log('value: ' + component.gameType)
  //   expect(component.gameType).toEqual(component.GameType.LOG2990);
  // });
  
  
  // it('2 clicking on LOG2990 button should set gameType attribute to LOG2990', () => {
  //   component.gameType = component.GameType.Classic;
  //   const log2990Button = fixture.debugElement.nativeElement.querySelector('#log2990-button');
  //   log2990Button.dispatchEvent(new Event('change'));
  //   expect(component.gameType).toEqual(component.GameType.LOG2990);
  // });

  // it('clicking on Classic button should set gameType attribute to Classic', () => {
  //   component.gameType = component.GameType.LOG2990;
  //   fixture.debugElement.nativeElement.querySelector('#classic-button').nativeElement.click();
  //   expect(component.gameType).toEqual(component.GameType.Classic);
  // });

  it('back button should reroute to home page', async () => {
    // const backButton = await loader.getHarness(MatButtonHarness.with({selector: '#back-button'}));
    const backButton = fixture.debugElement.nativeElement.querySelector('#back-button');
    const location: Location = TestBed.inject(Location);
    backButton.click();
    fixture.whenStable().then(() => {
      expect(location.path()).toBe('/home');
    });
  });


});
