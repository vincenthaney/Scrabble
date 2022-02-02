/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import BoardService from './board.service';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

describe('BoardService', () => {
    let service: BoardService;

    beforeEach(() => {
        service = new BoardService();
    });

    it('should be created', () => {
        expect(service).to.exist;
    });
});
