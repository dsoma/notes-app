
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
}
