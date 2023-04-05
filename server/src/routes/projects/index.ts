import { tasksRouter } from './tasks';
import { createChildRouter } from '@utils/router';

const router = createChildRouter();

router.post('/create', (req, res) => res.json('create'));
router.put('/edit', (req, res) => res.json('edit'));
router.post('/delete', (req, res) => res.json('delete'));

router.use('/tasks', tasksRouter);

export const projectsRouter = router;
