const express = require('express');
const session = require('express-session');
const app = express()
app.use(express.json());
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const {
    register,
    logIn,
    getUserInfo,
    validateUserByEmail,
    deleteTokenByEmail,
    deleteUser,
} = require('../controllers/user.ctl');

const {
    authenticate
} = require('../middleware/auth');

app.use(
    session({
        cookie: {
            secure: process.env.SESSION_SECURE,
            path: process.env.SESSION_PATH,
            maxAge: parseInt(process.env.SESSION_MAXAGE),
            httpOnly: process.env.SESSION_HTTPONLY,
            domain: process.env.SESSION_DOMAIN,
        },
        secret: process.env.SESSION_SECRET,
        reserve: false,
        name: process.env.SESSION_NAME,
        proxy: process.env.SESSION_PROXY,
        saveUninitialized: process.env.SESSION_UNINITIALIZED
    }),
);

app.post('/user-email', (req, res) => {
    return validateUserByEmail(req, res);
})

// Sign up for an account
app.post('/register', async (req, res) => {
    return register(req, res);
})

// Log in to your account
app.post('/login', async (req, res) => {
    return logIn(req, res);
})

// Save login information and display login information on the blog page
app.post('/user', authenticate, async (req, res) => {
    return getUserInfo(req, res);
})

app.delete(`/deletetoken`, authenticate, async (req, res) => {
    return deleteTokenByEmail(req, res);
})

app.delete(`/deleteuser`, async (req, res)  => {
    return deleteUser(req, res)
})

module.exports = app;