import { default as express } from 'express';
import * as path from 'path';
import { default as hbs } from'hbs';
import { default as logger } from 'morgan';
import { default as bodyParser } from 'body-parser';
import session from 'express-session';

// eslint-disable-next-line no-unused-vars
import dotenv from 'dotenv/config.js';

import { appRootDir } from './app-root-dir.js';
import { normalizePort } from './app-utils.js';
import { default as ErrorHandler } from './error-handler.js';
import { createLogFileStream, log, logError } from './app-logger.js';
import { getNoteStore } from './models/note-store-factory.js';

import { router as indexRouter } from './routes/index.js';
import { router as notesRouter } from './routes/notes.js';
import { router as usersRouter, initPassport } from './routes/users.js';
import { getSessionStore } from './session-store.js';

export const app = express();
export const sessionCookieName = 'notescookie.sid';
export let notesStore = null;

const __dirname    = appRootDir;
const APP_PORT     = 3000;
const PORT         = normalizePort(process.env.PORT || APP_PORT);
const LOG_FORMAT   = process.env.REQ_LOG_FORMAT || 'dev';
const DB_CONFIG    = process.env.DB_CONFIG || 'sequelize-sqlite.yaml';
const NOTES_DB     = process.env.NOTES_DB  || 'sequelize';
const REDIS_PORT   = process.env.REDIS_PORT || 6379;

let sessionStore = null;
let appServer    = null;

async function createSessionStore() {
    try {
        return await getSessionStore(process.env.REDIS_HOST, REDIS_PORT);
    } catch (e) {
        ErrorHandler.onError({ code: 'ESESSIONSTORE', e }, PORT);
    }
}

async function createNotesStore() {
    try {
        return await getNoteStore(NOTES_DB, DB_CONFIG);
    } catch (e) {
        ErrorHandler.onError({ code: 'ENOTESSTORE', e }, PORT);
    }
}

async function setupApp() {
    // View engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'hbs');
    hbs.registerPartials(path.join(__dirname, 'partials')); // partial docs

    app.set('env', 'development');
    app.set('port', PORT);

    app.use(logger(LOG_FORMAT, { stream: createLogFileStream(__dirname) }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/assets/vendor/feather-icons', express.static(path.join(__dirname, 'node_modules', 'feather-icons', 'dist')));
    app.use('/assets/vendor/popper/js',
            express.static(path.join(__dirname, 'node_modules', '@popperjs', 'core', 'dist', 'umd')));
    app.use('/assets/vendor/bootstrap/js',
            express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'js')));
    app.use('/assets/vendor/bootstrap/css',
            express.static(path.join(__dirname, 'theme', 'superhero')));

    app.use(session({
        store: sessionStore,
        secret: 'keypad screen',
        resave: false,
        saveUninitialized: false,
        name: sessionCookieName
    }));

    initPassport(app);

    app.use('/', indexRouter);
    app.use('/notes', notesRouter);
    app.use('/users', usersRouter);

    // error handlers
    app.use(ErrorHandler.handle404);
    app.use(ErrorHandler.basicErrorHandler);
}

async function startApp() {
    const server = app.listen(PORT, () => {
        log(`App listening on port ${PORT}`);
    });

    server.on('error', (e) => {
        logError(e);
        ErrorHandler.onError(e, PORT);
    });

    server.on('request', (req) => {
        log(`${new Date().toISOString()} request ${req.method} ${req.url}`);
    });

    return server;
}

async function onExit() {
    log('Closing . . .');
    await notesStore?.close();
    await appServer?.close();
    process.exit(0);
}

async function main() {
    const results = await Promise.all([ createSessionStore(), createNotesStore() ]);

    sessionStore = results[0];
    notesStore   = results[1];

    await setupApp();

    appServer = await startApp();

    process.on('SIGTERM', onExit);
    process.on('SIGINT', onExit);
    process.on('SIGHUP', onExit);
}

main().then().catch(e => logError(e));
