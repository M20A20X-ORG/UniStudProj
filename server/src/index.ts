import * as process from 'process';
import dotenv from 'dotenv';

import express, { RequestHandler } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { STORAGE_ROOT } from '@configs/storage';
import { ACCESS_ROLE, auth } from '@configs/auth';
import { log } from '@configs/logger';

import { appRouter } from '@routes/index';
import { logRequest } from '@middleware/logRequest';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }) as RequestHandler);
app.use(bodyParser.json() as RequestHandler);
app.use(express.static(STORAGE_ROOT));

app.use(logRequest);
app.use('/', appRouter);

log.debug(auth.createJwtToken({ userId: 1, role: ACCESS_ROLE.admin }));

app.listen(port, () => {
    log.info(`Server running on port: ${port}`);
});
