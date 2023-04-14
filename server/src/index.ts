import * as process from 'process';
import dotenv from 'dotenv';

import express, { RequestHandler } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { log } from '@configs/logger';
import { appRouter } from '@routes/index';
import { logRequest } from '@middleware/logRequest';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }) as RequestHandler);
app.use(bodyParser.json() as RequestHandler);

app.use(logRequest);
app.use('/', appRouter);

app.listen(port, () => {
    log.info(`Server running on port: ${port}`);
});
