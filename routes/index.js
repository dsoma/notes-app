import { default as express } from 'express';

export const router = express.Router();

// GET home page
router.get('/', async (req, res, next) => {
    try {
        res.render('index', { title: 'Notes App' });
    } catch (err) {
        next(err);
    }
});
