import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';

@Component({
  selector: 'app-game-creation-page',
  templateUrl: './game-creation-page.component.html',
  styleUrls: ['./game-creation-page.component.scss']
})
export class GameCreationPageComponent implements OnInit {
  GameType = GameType;
  GameMode = GameMode;

  gameType: GameType = GameType.Classic;
  gameMode: GameMode = GameMode.Solo;
  timer: number = 60;
  playerName: string;
  dictionnaryName: string = "default";

  playerNameController = new FormControl('', [
    Validators.pattern("^([a-zA-Z0-9]+[ '\\-]{0,1})*$"),
    Validators.minLength(2),
    Validators.maxLength(20)]);

  constructor(private router: Router) { }

  ngOnInit(): void {
  
  }

  createGame() {
    if (this.playerNameController.invalid) {
        // open dialog "please correct username"
    }
    else {
      // send new game request to server (?)
      // route to waiting room
      this.router.navigateByUrl('waiting');
    }
  }

}
