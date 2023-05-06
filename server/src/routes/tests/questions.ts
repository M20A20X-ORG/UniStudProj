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
const { questionIds, needResults } = QUESTION_QUERY;

router.delete(
    '/delete',
    ...requireQueryValidator(questionIds),
    requireAuth([admin, user], [mentor]),
    questionsController.deleteDeleteQuestions
);
router.post(
    '/create',
    requireSchemaValidator('http://example.com/schemas/test/question/creation'),
    requireAuth([admin, user], [mentor]),
    questionsController.postCreateQuestions
);
router.get(
    '/get',
    ...requireQueryValidator(questionIds, needResults),
    requireAuth([admin, user]),
    questionsController.getGetQuestions
);
router.put(
    '/edit',
    requireSchemaValidator('http://example.com/schemas/test/question/edit'),
    requireAuth([admin, user], [mentor]),
    questionsController.putEditQuestions
);

export const questionsRouter = router;
