import { Level } from 'level';

import { default as AbstractNotesStore } from './note-store.js';
import { default as Note } from './notes.js';

export default class NotesLevelDB extends AbstractNotesStore {
    constructor() {
        super();
        this._db = this._connect();
    }

    async create(key, title, content) {
        return this._createOrUpdate(key, title, content);
    }

    async update(key, title, content) {
        return this._createOrUpdate(key, title, content);
    }

    async read(key) {
        return Note.fromJson(await this._db.get(key));
    }

    async destroy(key) {
        await this._db.del(key);
    }

    async getAllNotes() {
        try {
            const notes = [];
            for await (const record of this._db.values()) {
                notes.push(Note.fromJson(record));
            }
            return notes;
        } catch (e) {
            throw new Error(`Fetching all notes failed: ${e}`);
        }
    }

    async keylist() {
        try {
            const keys = [];
            for await (const key of this._db.keys()) {
                keys.push(key);
            }
            return keys;
        } catch (e) {
            throw new Error(`Fetching all keys failed: ${e}`);
        }
    }

    async count() {
        const keys = await this.keylist();
        return keys.length;
    }

    async close() {
        await this._db.close();
    }

    _connect() {
        if (this._db) {
            return this._db;
        }

        this._db = new Level('data/notes.level', {
            createIfMissing: true,
            valueEncoding: 'json'
        });

        return this._db;
    }

    async _createOrUpdate(key, title, content) {
        const note = new Note(key, title, content);
        await this._db.put(key, note.toJson());
        return note;
    }
}
