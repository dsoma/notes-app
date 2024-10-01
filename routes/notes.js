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

router.get('/edit', async (req, res, next) => {
    try {
        const note = await notes.read(req.query.key);

        res.render('note_edit', {
            title: 'Edit Note',
            create: false,
            noteKey: req.query.key ?? '',
            note: note
        });
    } catch (err) {
        next(err);
    }
});

// Save a new note (CREATE/UPDATE)
router.post('/save', async (req, res, next) => {
    try {
        const operation = req.body.operation;
        if (operation === 'create') {
            await notes.create(req.body.noteKey, req.body.title, req.body.content);
        } else if (operation === 'update') {
            await notes.update(req.body.noteKey, req.body.title, req.body.content);
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
            title: '',
            noteKey: req.query.key,
            note: note
        });
    } catch (e) {
        next(e);
    }
});

// Confirm delete the note
router.get('/destroy', async (req, res, next) => {
    try {
        let note = await notes.read(req.query.key);

        res.render('note_delete', {
            title: note.title ?? '',
            noteKey: req.query.key,
            note: note
        });
    } catch (e) {
        next(e);
    }
});

// Delete the note (DELETE)
router.post('/destroy/confirm', async (req, res, next) => {
    try {
        await notes.destroy(req.body.noteKey);
        res.redirect('/');
    } catch(e) {
        next(e);
    }
});
