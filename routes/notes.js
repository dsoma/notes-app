import { default as express } from 'express';

import { notesStore as notes } from '../app.js';
import { ensureAuthenticated } from './users.js';

export const router = express.Router();

// Add a new note (CREATE)
router.get('/add', ensureAuthenticated, async (req, res, next) => {
    try {
        res.render('note_edit', {
            title: 'Add a new Note',
            create: true,
            noteKey: '',
            user: req.user,
            note: undefined
        });
    } catch (err) {
        next(err);
    }
});

router.get('/edit', ensureAuthenticated, async (req, res, next) => {
    try {
        const note = await notes.read(req.query.key);

        res.render('note_edit', {
            title: 'Edit Note',
            create: false,
            noteKey: req.query.key ?? '',
            user: req.user,
            note: note
        });
    } catch (err) {
        next(err);
    }
});

// Save a new note (CREATE/UPDATE)
router.post('/save', ensureAuthenticated, async (req, res, next) => {
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
router.get('/view', ensureAuthenticated, async (req, res, next) => {
    try {
        let note = await notes.read(req.query.key);

        res.render('note_view', {
            title: '',
            noteKey: req.query.key,
            note: note,
            user: req.user
        });
    } catch (e) {
        next(e);
    }
});

// Confirm delete the note
router.get('/destroy', ensureAuthenticated, async (req, res, next) => {
    try {
        let note = await notes.read(req.query.key);

        res.render('note_delete', {
            title: '',
            noteKey: req.query.key,
            note: note,
            user: req.user
        });
    } catch (e) {
        next(e);
    }
});

// Delete the note (DELETE)
router.post('/destroy/confirm', ensureAuthenticated, async (req, res, next) => {
    try {
        await notes.destroy(req.body.noteKey);
        res.redirect('/myHome');
    } catch(e) {
        next(e);
    }
});
