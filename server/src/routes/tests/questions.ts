import { QUESTION_QUERY } from '@schemas/tests/question';
import { ACCESS_ROLE, PROJECT_ACCESS_ROLE } from '@configs/auth';

import { createChildRouter } from '@utils/router';

import { requireSchemaValidator } from '@middleware/validateSchema';
import { requireAuth } from '@middleware/auth';
import { requireQueryValidator } from '@middleware/validateQuery';

import { questionsController } from '@controllers/question';

const router = createChildRouter();
const { admin, user } = ACCESS_ROLE;
const { mentor } = PROJECT_ACCESS_ROLE;

router.delete(
    '/delete',
    ...requireQueryValidator(QUESTION_QUERY.questionIds),
    requireAuth([admin, user], [mentor]),
    questionsController.deleteDeleteQuestion
);
router.post(
    '/create',
    requireSchemaValidator('http://example.com/schemas/test/question/creation'),
    requireAuth([admin, user], [mentor]),
    questionsController.postCreateQuestion
);
router.put('/edit', (req, res) => res.json('edit'));

export const questionsRouter = router;
