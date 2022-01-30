/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Application } from '@app/app';
import { Container } from 'typedi';
import * as supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import * as Express from 'express';
import { expect } from 'chai';
import { writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

const DEFAULT_FILENAME = `testing_file_${uuid()}.txt`;
const DEFAULT_FILE_CONTENT = 'This is the testing file';
const INVALID_FILENAME = `invalid_testing_file_${uuid()}.txt`;

describe('AssetsController', () => {
    let expressApp: Express.Application;

    beforeEach(() => {
        const app = Container.get(Application);
        expressApp = app.app;
    });

    it('should create', () => {
        expect(expressApp).to.exist;
    });

    describe('/assets/:fileName', () => {
        let path: string;

        beforeEach(() => {
            path = join(__dirname, '../../../assets', DEFAULT_FILENAME);
            writeFileSync(path, DEFAULT_FILE_CONTENT);
        });

        afterEach(() => {
            rmSync(path);
        });

        it('should return file', (done) => {
            supertest(expressApp).get(`/assets/${DEFAULT_FILENAME}`).expect(StatusCodes.OK, done);
        });

        it('should throw when file doesn\t exists', (done) => {
            supertest(expressApp).get(`/assets/${INVALID_FILENAME}`).expect(StatusCodes.NOT_FOUND, done);
        });
    });
});
