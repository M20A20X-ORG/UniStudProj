import * as process from 'process';
import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';

import { log } from '@configs/logger';
import { appRouter } from '@routes/index';
import { logRequest } from '@middleware/requestLogger';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(logRequest);
app.use('/', appRouter);

app.listen(port, () => {
    log.info(`Server running on port: ${port}`);
});
