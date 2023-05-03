import { ACCESS_ROLE } from '@configs/auth';
import { METRICS_QUERY } from '@schemas/metrics';

import { createChildRouter } from '@utils/router';

import { requireAuth } from '@middleware/auth';
import { requireQueryValidator } from '@middleware/validateQuery';

import { metricsController } from '@controllers/metrics';

const router = createChildRouter();
const { admin } = ACCESS_ROLE;

router.get('/get', requireAuth([admin]), metricsController.getGetMetrics);
router.put(
    '/update',
    ...requireQueryValidator(METRICS_QUERY.updateAction),
    requireAuth([admin]),
    metricsController.putUpdateMetrics
);

export const metricsRouter = router;
