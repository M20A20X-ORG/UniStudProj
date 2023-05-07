import * as process from 'process';
import dotenv from 'dotenv';

import express, { RequestHandler, static as exStatic } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { appRouter } from './routers/appRouter';
import { storageRoot } from '@configs/storageConfig';
import { ACCESS_ROLE, auth } from '@configs/authConfig';
import { log } from '@configs/loggerConfig';

import { logRequest } from '@middleware/logRequest';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }) as RequestHandler);
app.use(bodyParser.json() as RequestHandler);
app.use(exStatic(storageRoot));

app.use(logRequest);
app.use('/', appRouter);

log.debug(auth.createJwtToken({ userId: 1, role: ACCESS_ROLE.admin }));

app.listen(port, () => {
    log.info(`Server running on port: ${port}`);
});
