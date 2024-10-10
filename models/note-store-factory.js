
export async function getNoteStore(noteStoreModel, ...args) {
    try {
        const chosenNoteStore = await import(`./notes-${noteStoreModel}.js`);
        const chosenNoteStoreClass = chosenNoteStore.default;
        return new chosenNoteStoreClass(args);
    } catch (e) {
        throw new Error(`No recognized note store in ${noteStoreModel} because ${e}`);
    }
};
