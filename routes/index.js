import { default as express } from 'express';
import { NotesStore } from '../app.js';

export const router = express.Router();

// GET home page
router.get('/', async (req, res, next) => {
    try {
        const allNotes = await NotesStore.getAllNotes();
        console.log(`first = ${allNotes[0]}`);
        res.render('index', { title: '', notes: allNotes });
    } catch (err) {
        next(err);
    }
});
