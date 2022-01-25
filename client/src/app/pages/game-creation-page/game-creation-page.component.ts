import { Component, OnInit } from '@angular/core';
//import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-game-creation-page',
  templateUrl: './game-creation-page.component.html',
  styleUrls: ['./game-creation-page.component.scss']
})
export class GameCreationPageComponent implements OnInit {
  //gameParameters : FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

  // private initForm() {
  //   this.gameParameters = new FormGroup({
  //     'playerName': new FormControl(null, Validators.required),
  //     'gameMode': new FormControl(null),
  //     'gameStyle': new FormControl(null)
  //   });
  // }

}
