import { ACCESS_ROLE } from '@configs/authConfig';
import { NEWS_QUERY } from '@schemas/news';

import { createChildRouter } from '@utils/router';

import { requireAuth } from '@middleware/requireAuth';
import { requireSchemaValidator } from '@middleware/requireSchemaValidator';
import { requireQueryValidator } from '@middleware/requireQueryValidator';

import { newsController } from '@controllers/newsController';

const router = createChildRouter();
const { admin } = ACCESS_ROLE;
const { newsId } = NEWS_QUERY;

router.post(
    '/create',
    requireAuth([admin]),
    requireSchemaValidator('http://example.com/schemas/news/creation'),
    newsController.postCreateNews
);
router.get('/get', newsController.getGetNews);
router.put(
    '/edit',
    requireAuth([admin]),
    requireSchemaValidator('http://example.com/schemas/news/edit'),
    newsController.putEditNews
);
router.delete(
    '/delete',
    ...requireQueryValidator(newsId),
    requireAuth([admin]),
    newsController.deleteNews
);

export const newsRouter = router;
