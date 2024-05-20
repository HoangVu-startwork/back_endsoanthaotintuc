const nodemailer = require("nodemailer");
// create reusable transporter object using the default SMTP transport
require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: "mail9210.maychuemail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_AUTH_USER, // generated ethereal user
        pass: process.env.MAIL_AUTH_PASS, // generated ethereal password
    },
});

module.exports = {
    transporter,
} 