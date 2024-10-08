import fs from 'fs-extra';
import path from 'path';

import { appRootDir } from '../app-root-dir.js';
import { default as AbstractNotesStore } from './note-store.js';
import { default as Note } from './notes.js';

export default class NotesFileStore extends AbstractNotesStore {
    constructor() {
        super();
    }

    async create(key, title, content) {
        return this._createOrUpdate(key, title, content);
    }

    async update(key, title, content) {
        return this._createOrUpdate(key, title, content);
    }

    async read(key) {
        const notesDir = await this._notesDir();
        return await this._readJson(notesDir, key);
    }

    async destroy(key) {
        const notesDir = await this._notesDir();
        await fs.unlink(this._filePath(notesDir, key));
    }

    async getAllNotes() {
        const notesDir = await this._notesDir();
        let files = await fs.readdir(notesDir);
        if (!files) files = [];
        const notes = files.map(async fileName => {
            const key = path.basename(fileName, '.json');
            return await this._readJson(notesDir, key);
        });
        return Promise.all(notes);
    }

    async keylist() {
        const notesDir = await this._notesDir();
        let files = await fs.readdir(notesDir);
        if (!files) files = [];
        const keys = files.map(async fileName => {
            return path.basename(fileName, '.json');
        });
        return Promise.all(keys);
    }

    async count() {
        const notesDir = await this._notesDir();
        const files = await fs.readdir(notesDir);
        return files.length;
    }

    async close() { /**/ }

    async _createOrUpdate(key, title, content) {
        const notesDir = await this._notesDir();
        if (key.indexOf('/') >= 0) {
            throw new Error(`key ${key} cannot contain '/'`);
        }
        const note = new Note(key, title, content);
        const filePath = this._filePath(notesDir, key);
        await fs.writeFile(filePath, note.toJson(), 'utf8');
        return note;
    }

    async _notesDir() {
        const dir = process.env.NOTES_DIR || path.join(appRootDir, 'data');
        await fs.ensureDir(dir);
        return dir;
    }

    _filePath(notesDir, key) {
        return path.join(notesDir, `${key}.json`);
    }

    async _readJson(notesDir, key) {
        const filePath = this._filePath(notesDir, key);
        const noteJson = await fs.readFile(filePath, 'utf8');
        return Note.fromJson(noteJson);
    }
}
