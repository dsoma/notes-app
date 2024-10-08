/* eslint-disable no-fallthrough */

const NOT_FOUND   = 404;
const DEFAULT_ERR = 500;

export default class ErrorHandler {
    static handle404(req, res, next) {
        const err = new Error('Not Found');
        err.status = NOT_FOUND;
        next(err);
    }

    static basicErrorHandler(err, req, res, next) {
        // Defer to built-in error handler if headersSent
        // See: http://expressjs.com/en/guide/error-handling.html
        if (res.headersSent) {
            return next(err);
        }
    
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error   = req.app.get('env') === 'development' ? err : {};
    
        // render the error page
        res.status(err.status || DEFAULT_ERR);
        res.render('error');
    }

    /**
     * Event listener for HTTP server "error" event.
     */
    static onError(error, port) {
        if (error.syscall !== 'listen') {
            throw error;
        }
    
        const bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;
    
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);

            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);

            case 'ENOTESSTORE':
                console.error(`Notes data store init failure because `, error.error);
                process.exit(1);

            default:
                throw error;
        }
    }
}
