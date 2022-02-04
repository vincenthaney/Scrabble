import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { HttpException } from './http.exception';
import { describe } from 'mocha';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

// const DEFAULT_MESSAGE = 'default message';

class MockResponse {
    // eslint-disable-next-line no-unused-vars
    status(s: string): MockResponse {
        return this;
    }
    // eslint-disable-next-line no-unused-vars
    send<T>(arg: T): MockResponse {
        return this;
    }
}

describe('HttpException', () => {
    it('should create a simple HTTPException', () => {
        const createdMessage = 'Course created successfuly';
        const httpException: HttpException = new HttpException(createdMessage);

        expect(httpException.message).to.equals(createdMessage);
    });

    describe('sendError', () => {
        let response: Response;

        beforeEach(() => {
            response = new MockResponse() as unknown as Response;
        });

        it('should send INTERNAL_SERVER_ERROR by default', () => {
            const spy = chai.spy.on(response, 'status');
            const expectedStatus = StatusCodes.INTERNAL_SERVER_ERROR;

            try {
                throw new Error();
            } catch (e) {
                HttpException.sendError(e, response);
                expect(spy).to.have.been.called.with(expectedStatus);
            }
        });

        it('should send status from HttpException', () => {
            const spy = chai.spy.on(response, 'status');
            const expectedStatus = StatusCodes.IM_A_TEAPOT;

            try {
                throw new HttpException('', expectedStatus);
            } catch (e) {
                HttpException.sendError(e, response);
                expect(spy).to.have.been.called.with(expectedStatus);
            }
        });
    });
});
