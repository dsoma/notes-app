import mongodb from 'mongodb';

import AbstractNotesStore from './note-store.js';
import Note from './notes.js';
import { logError } from '../app-logger.js';

const MongoClient = mongodb.MongoClient;
const CLUSTER_URL = 'trialcluster.4oojl.mongodb.net/?retryWrites=true&w=majority&appName=TrialCluster';
const USER_ID     = 'dsoma:db_mongo_dsoma';
const DB_NAME     = 'notesApp';
const COLLECTION  = 'notes';

export default class NotesMongoDB extends AbstractNotesStore {
    
    constructor() {
        super();

        // Connection URI. See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
        this._uri    = 'mongodb+srv://' + USER_ID + '@' + CLUSTER_URL;
        this._client = new MongoClient(this._uri);
        this._connected = false;
    }

    async create(key, title, content) {
        let note = {};

        try {
            await this._connect();
            const collection = await this._getCollection();

            await collection.insertOne({
                key, title, content
            });

            note = new Note(key, title, content);
        } catch (e) {
            logError(`Document creation error: ${e}`);
        }

        return note;
    }

    async update(key, title, content) {
        await this._connect();
        const collection = await this._getCollection();

        const note = { key, title, content };
        const result = await collection.updateOne({ key }, { $set: note });

        if (result.modifiedCount) {
            return note;
        }

        logError(`Document with key = ${key} could not be updated`);
        return note;
    }

    async read(key) {
        await this._connect();
        const collection = await this._getCollection();
        const result = await collection.findOne({ key });
        if (!result) {
            throw new Error(`No note found with key = ${key}`);
        }
        return new Note(result.key, result.title, result.content);
    }

    async destroy(key) {
        await this._connect();
        const collection = await this._getCollection();
        const result = await collection.deleteOne({ key });
        if (!result.deletedCount) {
            logError(`Document(s) with key = ${key} not deleted`);
        }
    }

    async keylist() {
        await this._connect();
        const collection = await this._getCollection();
        const notesArr = await collection.find({}).toArray;
        if (!notesArr || !notesArr.length) {
            logError(`No notes found in the db`);
            return [];
        }
        const keys = [];
        notesArr.forEach(noteDoc => {
            keys.push(noteDoc.key);
        });
        return keys;
    }

    async getAllNotes() {
        await this._connect();
        const collection = await this._getCollection();
        const notesArr = await (collection.find({})).toArray();
        if (!notesArr || !notesArr.length) {
            logError(`No notes found in the db`);
            return [];
        }
        const notes = [];
        notesArr.forEach(noteDoc => {
            notes.push(new Note(noteDoc.key, noteDoc.title, noteDoc.content));
        });
        return notes;
    }

    async count() {
        await this._connect();
        const collection = await this._getCollection();
        return await collection.countDocuments({});
    }

    async close() {
        await this._client.close();
    }

    async _connect() {
        if (this._connected) {
            return;
        }

        await this._client.connect();
        this._connected = true;
    }

    async _getCollection(collection) {
        const _collection = collection || COLLECTION;
        return await this._client.db(DB_NAME).collection(_collection);
    }
}
