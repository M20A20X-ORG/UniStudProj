import dotenv from 'dotenv';

import express, { RequestHandler, static as exStatic } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { appRouter } from './routers/appRouter';
import { storageRoot } from '@configs/storageConfig';

import { logRequest } from '@middleware/logRequest';

dotenv.config();

const expressApp = express();

expressApp.use(cors());
expressApp.use(bodyParser.urlencoded({ extended: false }) as RequestHandler);
expressApp.use(bodyParser.json() as RequestHandler);
expressApp.use(exStatic(storageRoot));

expressApp.use(logRequest);
expressApp.use('/', appRouter);

export const app = expressApp;
