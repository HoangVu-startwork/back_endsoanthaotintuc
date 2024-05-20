const cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');
const mongoose = require('mongoose');
const Ucademy = require('./src/routes/blog-ucademy.rts.js')
const Dicom = require('./src/routes/blog-dicom.rts.js')
const EditBlog = require('./src/routes/blog.rts.js')
const User = require('./src/routes/user.rts.js')
const { connectToMongoDB } = require('./src/database/mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const {
  emailNotificationContact,
  emailNotificationSubscrition,
  emailNotificationEnquiry,
} = require('./src/controllers/movinavir.ctl')

const {
  deployChemcareFeDev,
  deployChemcareFeTest,
  deployChemcareFeProd,
  deployMovinaviarFeDev,
  deployMovinaviarFeTest,
  deployMovinaviarFeProd,
  deployDicomUniversalApiProd,
} = require('./deploy-utils')

const {
  careerApply,
  developWebRequest,
  freeQuoteRequest,
} = require('./src/controllers/dicom.ctl');


const port = process.env.PORT;
const app = express()
// enable json
app.use(express.json());
connectToMongoDB()
// enable cross
app.use(cors());
app.use(Ucademy);
app.use(Dicom);
app.use(EditBlog);
app.use(User);
// default options
app.use(fileUpload());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// authenticator
// app.use(basicAuth({
//   users: { 'dicom': 'XXXfdisfuhwifwuh@434da!@lfbwefkebfwebfwejfhbcwk' }
// }))


app.use((req, res, next) => {
  console.log("-------> calling :: ", req.path)
  next();
});

app.get('/ping', async (req, res) => {
  return res.send({ version: 1.0 })
})

app.post('/movinavir/contact-us', async (req, res) => {
  return emailNotificationContact(req, res)
})

// app.use(
//   session({
//     secret: process.env.SECRET_KEY,
//     reserve: false,
//     saveUninitialized: false,
//   })
// );

app.post('/movinavir/subscription', async (req, res) => {
  return emailNotificationSubscrition(req, res)
})

app.post('/movinavir/enquiry', async (req, res) => {
  return emailNotificationEnquiry(req, res)
})

// -----------------------------------
// deploy movinavir
// -----------------------------------

app.post('/movinavir/deploy-fe-dev', async (req, res) => {
  return deployMovinaviarFeDev(req, res)
})

app.post('/movinavir/deploy-fe-test', async (req, res) => {
  return deployMovinaviarFeTest(req, res)
})

app.post('/movinavir/deploy-fe-prod', async (req, res) => {
  return deployMovinaviarFeProd(req, res)
})

// -----------------------------------
// deploy chemcare
// -----------------------------------

app.post('/chemcare/deploy-fe-dev', async (req, res) => {
  return deployChemcareFeDev(req, res)
})

app.post('/chemcare/deploy-fe-test', async (req, res) => {
  return deployChemcareFeTest(req, res)
})

app.post('/chemcare/deploy-fe-prod', async (req, res) => {
  return deployChemcareFeProd(req, res)
})

// -----------------------------------
// deploy universal api
// -----------------------------------

app.post('/movinavir/deploy-universal-api', async (req, res) => {
  return deployDicomUniversalApiProd(req, res)
})

// -----------------------------------
// app
// -----------------------------------
app.post('/dicom/career-apply', careerApply)

// only for Vietnam market
app.post('/dicom/develop-web-request', developWebRequest)

// exclude Vietnam market
app.post('/dicom/free-quote-request', freeQuoteRequest)

// const User = mongoose.model('logins', userSchema);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

