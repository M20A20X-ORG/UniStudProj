import { createChildRouter } from '@utils/router';

const router = createChildRouter();

router.post('/register', (req, res) => res.json('register'));
router.get('/get', (req, res) => res.json('get'));
router.put('/edit', (req, res) => res.json('edit'));
router.post('/delete', (req, res) => res.json('delete'));

export const usersRouter = router;
