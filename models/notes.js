
export default class Note {
    constructor(key, title, content) {
        this._key = key;
        this._title = title;
        this._content = content;
    }

    get key()       { return this._key; }
    get title()     { return this._title; }
    get content()   { return this._content; }

    set title(newTitle)     { this._title = newTitle; }
    set content(newContent) { this._content = newContent; }

    // Return a JSON string of this note
    toJson() {
        return JSON.stringify({
            key: this._key,
            title: this._title,
            content: this._content
        });
    }

    toJsonObj() {
        return {
            key: this._key,
            title: this._title,
            content: this._content
        };
    }

    static fromJson(jsonNote) {
        const noteData = JSON.parse(jsonNote);
        if (typeof noteData !== 'object') {
            throw new Error(`Not a valid note object ${jsonNote}`);
        }

        Note._validate(noteData);

        return new Note(noteData.key, noteData.title, noteData.content);
    }

    static fromSQNote(sqNote) {
        if (typeof sqNote.key !== 'string' || typeof sqNote.title !== 'string' || typeof sqNote.content !== 'string') {
            throw new Error(`Invalid key types in note ${sqNote}`);
        }
        return new Note(sqNote.key, sqNote.title, sqNote.content);
    }

    static _validate(noteObj) {
        const properties = Object.keys(noteObj);
        if (!properties.includes('key') || !properties.includes('title') || !properties.includes('content')) {
            throw new Error(`Note does not contain valid keys ${noteObj}`);
        }

        if (typeof noteObj.key !== 'string' || typeof noteObj.title !== 'string' || typeof noteObj.content !== 'string') {
            throw new Error(`Invalid key types in note ${noteObj}`);
        }
    }
}
