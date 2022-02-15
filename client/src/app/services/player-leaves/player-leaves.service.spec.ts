import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerLeavesController } from '@app/controllers/player-leaves-controller/player-leaves.controller';
import { SocketService } from '..';
import { PlayerLeavesService } from './player-leaves.service';

describe('PlayerLeavesService', () => {
    let service: PlayerLeavesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule],
            providers: [PlayerLeavesController, SocketService],
        });
        service = TestBed.inject(PlayerLeavesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
