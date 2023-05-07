import { ACCESS_ROLE } from '@configs/authConfig';
import { METRICS_QUERY } from '@schemas/metrics';

import { createChildRouter } from '@utils/router';

import { requireAuth } from '@middleware/requireAuth';
import { requireQueryValidator } from '@middleware/requireQueryValidator';

import { metricsController } from '@controllers/metricsController';

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
