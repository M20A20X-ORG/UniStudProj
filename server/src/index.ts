import * as process from 'process';
import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.listen(port, () => {
    console.info(`Server running on port: ${port}`);
});
