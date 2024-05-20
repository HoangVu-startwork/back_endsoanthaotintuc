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
const { getUserById } = require('../services/user');
const JWT_SECRET = process.env.JWTPRIVATEKEY;

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization');
    try {
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        const email = decoded.email;
        const existingToken = await getUserById(userId, token)
        if (!existingToken) {
            return res.status(401).json({ error: 'Invalid token: User not found' });
        }
        req.user = { userId, email };
        req.token = token
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token: Decoding error' });
    }
}

module.exports = {
    authenticate,
} 