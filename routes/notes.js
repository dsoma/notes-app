import { default as express } from 'express';
import { NotesStore as notes } from '../app.js';

export const router = express.Router();

// Add a new note (CREATE)
router.get('/add', async (req, res, next) => {
    try {
        res.render('note_edit', {
            title: 'Add a new Note',
            create: true,
            noteKey: '',
            note: undefined
        });
    } catch (err) {
        next(err);
    }
});

// Save a new note (CREATE/UPDATE)
router.post('/save', async (req, res, next) => {
    try {
        if (req.body.operation === 'create') {
            await notes.create(req.body.noteKey, req.body.title, req.body.content);
        }
        res.redirect('/notes/view?key=' + req.body.noteKey);
    } catch (e) {
        next(e);
    }
});

// Read and Display Note (READ)
router.get('/view', async (req, res, next) => {
    try { 
        let note = await notes.read(req.query.key);

        res.render('note_view', {
            title: note.title ?? '',
            noteKey: req.query.key,
            note: note
        });
    } catch (e) {
        next(e);
    }
});
