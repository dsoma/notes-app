
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
}
