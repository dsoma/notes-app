import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { getNoteStore } from '../models/note-store-factory';
import Note from '../models/notes';

let store;

describe('[NoteStoreFactory]', () => {
    test('it should successfully load the model', async () => {
        try {
            console.log(`Notes model = ${process.env.NOTES_DB}`);
            const dbConfigFile = process.env.DB_CONFIG;
            store = await getNoteStore(process.env.NOTES_DB, dbConfigFile);
        } catch (e) {
            console.error(e);
            throw e;
        }
    });
});

describe('[NoteStore]', () => {
    describe('[entries]', () => {
        beforeAll(async () => {
            expect(store).toBeDefined();
            await store.create(`k1`, 'title-1', 'note-1');
            await store.create(`k2`, 'title-2', 'note-2');
            await store.create(`k3`, 'title-3', 'note-3');
        });

        afterAll(async () => {
            const keys = await store.keylist();
            for (const key of keys) {
                await store.destroy(key);
            }
        });

        test('it should have three entries', async () => {
            expect(store).toBeDefined();
            const keys = await store.keylist();
            expect(keys).toBeDefined();
            expect(keys).toBeInstanceOf(Array);
            expect(keys.length).toBe(3);
        });

        test('it should have correct keys', async () => {
            expect(store).toBeDefined();
            const keys = await store.keylist();
            expect(keys).toBeInstanceOf(Array);
            keys.forEach((key, i) => {
                expect(key).toBe(`k${i+1}`);
            });
        });

        test('it should have correct note entries', async () => {
            expect(store).toBeDefined();
            const notes = await store.getAllNotes();
            expect(notes).toBeInstanceOf(Array);
            notes.forEach((note, i) => {
                expect(note).toBeInstanceOf(Note);
                expect(note.key).toBe(`k${i+1}`);
                expect(note.title).toBe(`title-${i+1}`);
                expect(note.content).toBe(`note-${i+1}`);
            });
        });

        test('count should be correct', async () => {
            expect(store).toBeDefined();
            const count = await store.count();
            expect(count).toBe(3);
        });

        test('it should read the correct entry', async () => {
            const entry = await store.read('k2');
            expect(entry).toBeInstanceOf(Note);
            expect(entry.key).toBe(`k2`);
            expect(entry.title).toBe(`title-2`);
            expect(entry.content).toBe(`note-2`);
        });

        test('it should fail if key is unknown', async () => {
            let entry;
            try {
                entry = await store.read('foo');
                expect(entry).toBeUndefined();
            } catch(e) {
                expect(entry).toBeUndefined();
                return e;
            }
        });
    });
});

