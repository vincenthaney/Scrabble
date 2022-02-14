// import { Injectable } from '@angular/core';
// import { Router } from '@angular/router';
// import { StartMultiplayerGameData } from '@app/classes/communication/game-config';
// import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
// import { GameService, SocketService } from '..';

// @Injectable({
//     providedIn: 'root',
// })
// export class ReconnectionService {
//     constructor(
//         public router: Router,
//         private socketService: SocketService,
//         private gameController: GamePlayController,
//         private gameService: GameService,
//     ) {}
//     // if (this.router.url === '/game') {
//     // console.log(`gameService gameId : ${this.gameId}`);

//     async setupReconnection() {
//       console.log('reconnect init');

//         const gameIdCookie = this.getCookie('gameId');
//         const socketIdCookie = this.getCookie('socketId');
//         // console.log(`reconnectGame gameId : ${gameIdCookie}`);
//         // console.log(`reconnectGame socketIdCookie : ${socketIdCookie}`);
//         // console.log(`reconnectGame newSocketId : ${this.socketService.getId()}`);
//         console.log(this.router.url);
//         // this.router.url === '/game' && 
//         if (gameIdCookie !== '' && socketIdCookie !== '') {
//             console.log('reconnect to game ');
          
//             await this.reconnect(gameIdCookie, socketIdCookie);
//             // } else {
//             //     console.log(`noActiveGameEvent emit`);
//             //     this.noActiveGameEvent.emit();
//             // }
//         }
//     }
//     async reconnect(gameIdCookie: string, socketIdCookie: string) {
//         this.gameController.handleReconnection(gameIdCookie, socketIdCookie, this.socketService.getId());
//         return new Promise<void>((resolve) => {
//             this.socketService.on('startGame', async (startGameData: StartMultiplayerGameData[]) => {
//                 await this.gameService.initializeMultiplayerGame(this.socketService.getId(), startGameData[0]);
//                 console.log('resolve de STARTGAME');
//                 resolve();
//             });
//         });
//     }


// }
