import * as process from 'process';
import { app } from './app';

import { ACCESS_ROLE, auth } from '@configs/authConfig';
import { log } from '@configs/loggerConfig';

log.debug(auth.createJwtToken({ userId: 1, role: ACCESS_ROLE.admin }));

const port = process.env.PORT;
app.listen(port, () => {
    log.info(`Server running on port: ${port}`);
});
