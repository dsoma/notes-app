import { default as sqlite3 } from 'sqlite3';

import { default as AbstractNotesStore } from './note-store.js';
import { default as Note } from './notes.js';

export default class NotesSqliteDB extends AbstractNotesStore {
    constructor() {
        super();
    }

    async create(key, title, content) {
        this._db = await this._connect();
        const note = new Note(key, title, content);
        await new Promise((resolve, reject) => {
            const query = "INSERT INTO notes (key, title, content) " +
                          "VALUES ( ?, ?, ? );";
            this._db.run(query, [ key, title, content ],
                err => {
                    if (err) return reject(err);
                    resolve(note);
                }
            );
        });
        return note;
    }

    async update(key, title, content) {
        this._db = await this._connect();
        const note = new Note(key, title, content);
        await new Promise((resolve, reject) => {
            const query = "UPDATE notes SET title = ?, content = ? WHERE key = ?";
            this._db.run(query, [ title, content, key ],
                err => {
                    if (err) return reject(err);
                    resolve(note);
                }
            );
        });
        return note;
    }

    async read(key) {
        this._db = await this._connect();
        return await new Promise((resolve, reject) => {
            const query = "SELECT * FROM notes WHERE key = ?";
            this._db.get(query, [key],
                (err, row) => {
                    if (err) return reject(err);
                    if (!row) return reject(new Error(`No Note found for key = ${key}`));
                    const note = row ? new Note(row.key, row.title, row.content) : {};
                    resolve(note);
                }
            )
        });
    }

    async destroy(key) {
        this._db = await this._connect();
        return await new Promise((resolve, reject) => {
            const query = "DELETE FROM notes WHERE key = ?;";
            this._db.run(query, [key],
                err => {
                    if (err) return reject(err);
                    resolve();
                }
            )
        });
    }

    async keylist() {
        this._db = await this._connect();
        return await new Promise((resolve, reject) => {
            const query = "SELECT key FROM notes";
            this._db.all(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows.map(row => row.key));
            });
        });
    }

    async getAllNotes() {
        this._db = await this._connect();
        return await new Promise((resolve, reject) => {
            const query = "SELECT * FROM notes";
            this._db.all(query, (err, rows) => {
                if (err) return reject(err);
                const notes = [];
                if (rows?.length) {
                    rows.map(row => {
                        notes.push(new Note(row.key, row.title, row.content));
                        return row;
                    });
                }
                resolve(notes);
            });
        });
    }

    async count() {
        this._db = await this._connect();
        return await new Promise((resolve, reject) => {
            const query = "select count(key) as count from notes";
            this._db.get(query, (err, row) => {
                if (err) return reject(err);
                resolve(row.count);
            });
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            this._db.close(err => {
                if (err) reject(err);
                else {
                    this._db = undefined;
                    resolve();
                }
            });
        });
    }

    async _connect() {
        if (this._db) {
            return this._db;
        }

        this._db = await new Promise((resolve, reject) => {
            const db = new sqlite3.Database('data/notes.sqlite3',
                sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
                err => {
                    if (err) return reject(err);
                    resolve(db);
                });
        });

        return this._db;
    }
}
