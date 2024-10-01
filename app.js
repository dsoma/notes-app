import { default as express } from 'express';
import * as path from 'path';
import * as url from 'url';
import { default as hbs } from'hbs';
import { default as logger } from 'morgan';
import { default as bodyParser } from 'body-parser';

import { normalizePort } from './app-utils.js';
import { default as ErrorHandler } from './error-handler.js';

import { NotesMemCache } from './models/notes-memcache.js';

import { router as indexRouter } from './routes/index.js';
import { router as notesRouter } from './routes/notes.js';

export const app = express();
export const NotesStore = new NotesMemCache();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const APP_PORT   = 3000;
const PORT       = normalizePort(process.env.PORT || APP_PORT);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'partials')); // partial docs

app.set('env', 'development');
app.set('port', PORT);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));

app.use('/', indexRouter);
app.use('/notes', notesRouter);

// error handlers
app.use(ErrorHandler.handle404);
app.use(ErrorHandler.basicErrorHandler);

const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});

server.on('error', (e) => {
    console.log(e);
});
