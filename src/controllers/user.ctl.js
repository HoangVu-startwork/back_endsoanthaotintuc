const path = require('path');
const bcrypt = require('bcrypt');
const express = require("express");
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = express();
const dotenv = require('dotenv');
const multer = require('multer');
const { S3 } = require("@aws-sdk/client-s3");
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
app.use(express.static('public'));
dotenv.config({ path: '.env' });

const User = require('../models/user.models');

const JWT_SECRET = process.env.JWTPRIVATEKEY;
const { getUserByEmail, getUserId, deleteUserEmail } = require('../services/user');
const { Console } = require('console');
const activeSessions = {};

async function register(req, res) {
    email = req.body.email;
    try {
        const isExistedUser = await getUserByEmail(email);
        if (isExistedUser) {
            return res.status(400).json({ error: "Account already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;

        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).json({ message: "Sign Up Success!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function logIn(req, res) {
    const { email, password } = req.body;
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            return res.json({ error: "Email or password is invalid" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: process.env.PERIOD });
            user.token = token;
            await user.save();
            return res.json({ status: "ok", role: user.role, token: token, data: token });
        }
        res.json({ status: "error", error: "Email or password is invalid" });
    } catch (error) {
        res.json({ status: "error", error: error.message });
    }
}




async function getUserInfo(req, res) {
    const token = req.header('Authorization');
    try {
        if (!token) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }
        const user = jwt.verify(token, JWT_SECRET);
        const data = await getUserByEmail(user.email);
        return res.status(200).json({ status: 'ok', data: data });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}

async function deleteTokenByEmail(req, res) {
    const token = req.header('Authorization');
    try {
        const user = jwt.verify(token, JWT_SECRET);
        const email = user.email;
        const data = await getUserByEmail(email);
        if (!data) {
            throw new Error("User not found");
        }
        data.token = undefined;
        await data.save();
        return res.status(200).json({ status: 'ok', data: data });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}

function validateUserByEmail(req, res) {
    const { data } = req.body;
    try {
        if (data) {
            res.send({ status: "ok" });
        } else {
            res.send({ status: "User not found" });
        }
    } catch (err) {
        res.send({ status: "Something went wrong again" });
    }
}

async function deleteUser(req, res) {
    const { email } = req.query;
    try {
        const data = await deleteUserEmail(email);
        if (!data) {
            throw new Error("User not found");
        }
        await data.save();
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

module.exports = {
    register,
    logIn,
    getUserInfo,
    validateUserByEmail,
    deleteTokenByEmail,
    deleteUser,
} 