
import { default as AbstractNotesStore } from './note-store.js'
import { default as Note } from './notes.js'

export class NotesMemCache extends AbstractNotesStore {

    constructor() {
        super();
        this._notes = [];
    }

    async create(key, title, content) {
        this._notes[key] = new Note(key, title, content);
        return this._notes[key];
    }

    async read(key) {
        if (this._notes[key]) {
            return this._notes[key];
        }

        throw new Error(`Note ${key} does not exist`);
    }

    async update(key, title, content) {
        this._notes[key] = new Note(key, title, content);
        return this._notes[key];
    }

    async destroy(key) {
        if (this._notes[key]) {
            delete this._notes[key];
            return;
        }

        throw new Error(`Note ${key} does not exist`);
    }

    async keylist() {
        return Object.keys(this._notes);
    }

    async count() {
        return this._notes.length;
    }

    async getAllNotes() {
        const notes = [];
        Object.keys(this._notes).forEach(key => notes.push(this._notes[key]));
        return notes;
    }

    async close() { /**/ }
}
