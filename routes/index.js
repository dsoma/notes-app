import { default as express } from 'express';
import { NotesStore } from '../app.js';

export const router = express.Router();

// GET home page
router.get('/', async (req, res, next) => {
    try {
        res.render('index', {
            title: '',
            user: req.user
        });
    } catch (err) {
        next(err);
    }
});

router.get('/myHome/', async (req, res, next) => {
    try {
        const allNotes = await NotesStore.getAllNotes();
        res.render('personal_home', {
            title: '',
            notes: allNotes,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
});
