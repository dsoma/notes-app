import { Sequelize } from 'sequelize';

import AbstractNotesStore from './note-store.js';
import Sequelizer from './sequelizer.js';
import Note from './notes.js';
import { logError } from '../app-logger.js';

const DataTypes = Sequelize.DataTypes;

export class SQNote extends Sequelize.Model {};

export default class NotesSequelizedDB extends AbstractNotesStore {
    
    constructor(sequelizerConfig) {
        super();
        this._sequelizer = new Sequelizer(sequelizerConfig);
        this._connected  = false;
    }

    async create(key, title, content) {
        await this._connect();
        const sqNote = await SQNote.create({ key, title, content });
        return Note.fromSQNote(sqNote);
    }

    async update(key, title, content) {
        try {
            await this._connect();
            let sqNote = await SQNote.findOne({ where: { key } });
            if (!sqNote) {
                throw new Error(`No note found for key ${key}`);
            }
            sqNote.set({ title, content });
            sqNote = await sqNote.save();
            return Note.fromSQNote(sqNote);
        } catch (e) {
            logError(`Could not update note with key = ${key}. Error = ${e}`);
        }
    }

    async read(key) {
        try {
            await this._connect();
            const sqNote = await SQNote.findOne({ where: { key } });
            if (!sqNote) {
                throw new Error(`No note found for key ${key}`);
            }
            return Note.fromSQNote(sqNote);
        } catch (e) {
            logError(`Could not read note with key = ${key}. Error = ${e}`);
        }
    }

    async destroy(key) {
        try {
            await this._connect();
            await SQNote.destroy({ where: { key }});
        } catch (e) {
            logError(`Could not delete note with key = ${key}. Error = ${e}`);
        }
    }

    async keylist() {
        try {
            await this._connect();
            const sqNotes = await this.SQNote.findAll();
            let keys = [];
            sqNotes.map(note => {
                if (typeof note.key === 'string') {
                    keys.push(note.key);
                }
            });
            return keys;
        } catch (e) {
            logError(`Could not fetch all keys. Error = ${e}`);
        }
    }

    async getAllNotes() {
        try {
            await this._connect();
            const sqNotes = await SQNote.findAll();
            let notes = [];
            sqNotes.map(note => {
                notes.push(Note.fromSQNote(note));
            });
            return notes;
        } catch (e) {
            logError(`Could not fetch all notes. Error = ${e}`);
        }
    }

    async count() {
        try {
            await this._connect();
            const result = await SQNote.findAndCountAll();
            return result.count;
        } catch (e) {
            logError(`Could not fetch all keys. Error = ${e}`);
        }
    }

    async close() {
        if (!this._connected) {
            return;
        }

        await this._sequelizer.close();
        this._connected = false;
    }

    async _connect() {
        if (this._connected) {
            return;
        }

        await this._sequelizer.connect();

        const noteAttrs = {
            key: { type: DataTypes.STRING, primaryKey: true, unique: true },
            title: DataTypes.STRING,
            content: DataTypes.TEXT
        };

        const options = {
            sequelize: this._sequelizer.instance,
            modelName: 'SQNote'
        };

        SQNote.init(noteAttrs, options);

        await SQNote.sync();

        this._connected = true;
    }
}
