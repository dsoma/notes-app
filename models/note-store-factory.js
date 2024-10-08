
export async function getNoteStore(noteStoreModel) {
    try {
        const chosenNoteStore = await import(`./notes-${noteStoreModel}.js`);
        const chosenNoteStoreClass = chosenNoteStore.default;
        return new chosenNoteStoreClass();
    } catch (e) {
        throw new Error(`No recognized note store in ${noteStoreModel} because ${e}`);
    }
};
