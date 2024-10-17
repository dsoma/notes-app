import { default as express } from 'express';
import { default as Passport } from 'passport';
import { default as PassportLocal } from 'passport-local';
import passportTwitter from 'passport-twitter';

import { sessionCookieName } from '../app.js';
import { default as UsersDb } from '../models/users-client.js';

export const router = express.Router();

const LocalStrategy   = PassportLocal.Strategy;
const TwitterStrategy = passportTwitter.Strategy;

export function initPassport(app) {
    app.use(Passport.initialize());
    app.use(Passport.session());
}

// Check if authenticated.
// yes - continue; no - redirect to login page
export function ensureAuthenticated(req, res, next) {
    try {
        if (req.user) {
            next();
        } else {
            res.redirect('/users/login');
        }
    } catch (e) {
        next(e);
    }
}

// Login Page
router.get('/login', (req, res, next) => {
    try {
        res.render('login', { title: 'Login', user: req.user });
    } catch (e) {
        next(e);
    }
});

// User login authentication
// router.post('/login', Passport.authenticate('local', {
//     successRedirect: '/myHome',
//     failureRedirect: '/users/login',
//     failureMessage: true
// }));

router.post('/login', async (req, res, next) => {
    Passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            const message = info || 'Incorrect username or password';
            return res.render('login', { title: 'Login', user: req.user, message });
        }

        req.login(user, (err) => {
            if (err) { return next(err); }
            return res.redirect('/myHome/');
        });
    })(req, res, next);
});

// Profile page
router.get('/profile', ensureAuthenticated, (req, res, next) => {
    try {
        res.render('profile', { title: 'Profile', user: req.user });
    } catch (e) {
        next(e);
    }
});

// Logout
router.get('/logout', (req, res, next) => {
    try {
        req.session.destroy();
        req.logout(() => {
            res.clearCookie(sessionCookieName);
            res.redirect('/');
        });
    } catch (e) {
        next(e);
    }
});

router.get('/auth/twitter/', Passport.authenticate('twitter'));

router.get('/auth/twitter/callback', Passport.authenticate('twitter', {
    successRedirect: '/myHome',
    failureRedirect: '/users/login'
}));

// Authenticate user using Passport local strategy
Passport.use(new LocalStrategy(async (username, password, callback) => {
    try {
        const result = await UsersDb.authenticateUser(username, password);
        if (result.check) {
            const username = result.username;
            callback(null, { id: username, username });
        } else {
            callback(null, false, result.message);
        }
    } catch (e) {
        callback(e);
    }
}));

// Attach username to the session (what gets saved in the cookie)
Passport.serializeUser((user, callback) => {
    try {
        callback(null, user.username);
    } catch (e) {
        callback(e);
    }
});

// Finding and attaching the user to the request (req.user)
Passport.deserializeUser(async (username, callback) => {
    try {
        const user = await UsersDb.find(username);
        if (!user) {
            callback(new Error(`No user found with username = ${username}`));
            return;
        }

        callback(null, user);
    } catch (e) {
        callback(e);
    }
});

// Setup and use Twitter strategy to authenticate
const twitterCallback = process.env.TWITTER_CALLBACK_HOST
                      ? process.env.TWITTER_CALLBACK_HOST
                      : 'http://localhost:3000';

export let twitterLogin = false;

if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    Passport.use(new TwitterStrategy({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: `${twitterCallback}/users/auth/twitter/callback`
    },
    async (token, tokenSecret, profile, done) => {
        try {
            const user = await UsersDb.findOrCreate({
                id: profile.username,
                username: profile.username,
                password: '',
                provider: profile.provider,
                familyName: profile.displayName,
                givenName: '',
                middleName: '',
                photos: profile.photos,
                emails: profile.emails
            });
            done(null, user);
        } catch (e) {
            done(e);
        }
    }));

    twitterLogin = true;
}
