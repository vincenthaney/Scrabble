import { HttpException } from '@app/classes/http.exception';
import { Router, Response } from 'express';
import { existsSync } from 'fs';
import { StatusCodes } from 'http-status-codes';
import { join } from 'path';
import { Service } from 'typedi';
import { AssetsRequest } from './assets.controller.types';

@Service()
export class AssetsController {
    router: Router;

    constructor() {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         *
         * Definition:
         *   Assets:
         *     type: file
         *
         */

        /**
         * @swagger
         * tags:
         *   - name: Assets
         *     description: Assets endpoints
         */

        /**
         * @swagger
         * /assets/{fileName}:
         *   parameters:
         *     - in: path
         *       name: fileName
         *       required: true
         *       description: File name
         *   get:
         *     description: Return an asset from filepath
         *     tags:
         *       - Assets
         *     responses:
         *       200:
         *         description: returned
         *       404:
         *         description: file not found
         *
         */
        this.router.get('/:fileName', (req: AssetsRequest, res: Response) => {
            const fileName = req.params.fileName;
            const dir = join(__dirname, '../../../assets');
            const filePath = join(dir, fileName);

            if (fileName.length === 0) {
                const error = new HttpException('File name is required', StatusCodes.BAD_REQUEST);
                res.status(error.status).send(error.toObject());
            } else if (existsSync(filePath)) {
                res.status(StatusCodes.OK).sendFile(filePath);
            } else {
                const error = new HttpException(`No file names "${fileName}" in directory "/assets"`, StatusCodes.NOT_FOUND);
                res.status(error.status).send(error.toObject());
            }
        });
    }
}
