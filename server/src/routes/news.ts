import { ACCESS_ROLE } from '@configs/auth';
import { COMMON_QUERY } from '@schemas/index';
import { NEWS_QUERY } from '@schemas/news';

import { createChildRouter } from '@utils/router';

import { requireAuth } from '@middleware/auth';
import { requireSchemaValidator } from '@middleware/validateSchema';
import { requireQueryValidator } from '@middleware/validateQuery';

import { newsController } from '@controllers/news';

const router = createChildRouter();
const { admin } = ACCESS_ROLE;
const { newsIds } = NEWS_QUERY;
const { isNeedCommon, limit } = COMMON_QUERY;

router.post(
    '/create',
    requireAuth([admin]),
    requireSchemaValidator('http://example.com/schemas/news/creation'),
    newsController.postCreateNews
);
router.get(
    '/get',
    ...requireQueryValidator(newsIds, isNeedCommon, limit),
    newsController.getGetNews
);
router.put(
    '/edit',
    requireAuth([admin]),
    requireSchemaValidator('http://example.com/schemas/news/edit'),
    newsController.putEditNews
);
router.delete(
    '/delete',
    ...requireQueryValidator(newsIds),
    requireAuth([admin]),
    newsController.deleteNews
);

export const newsRouter = router;
