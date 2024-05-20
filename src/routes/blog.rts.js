const express = require('express');
const session = require('express-session');
const app = express()
const multer = require('multer');
const { S3 } = require("@aws-sdk/client-s3");
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
// const upload = multer().single('image');
app.use(express.static('public'));
const Blog = require('../models/blog.models');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
const {
  create,
  getAllBlogs,
  getCode,
  getBlog,
  deleteBlog,
  updateBlog,
  getTotalRecords,
  uploadAvatar,
  uploadImageTitle,
  uploadMetaImage,
  uploadImageContent,
  deleteAvatar,
  deleteImage,
  getLanguageDicom,
} = require('../controllers/blog.ctl');

const {
  authenticate
} = require('../middleware/auth');

const { appendFileSync } = require('fs');

// Add blog data to the database
app.post('/create', authenticate, async (req, res) => {
  return create(req, res);
})

// Display data on Blog page with search function by name and by page (ucademy, dicom) and pagination
app.get('/blogs', authenticate, async (req, res) => {
  return getAllBlogs(req, res);
})

// Code classification for Blogs (EN, VN)
app.get('/code', authenticate, async (req, res) => {
  return getCode(req, res);
})
// This code is to create a lottery code when creating the first blog (vn or en). The user will choose the code of the blog related to the next blog.
app.get('/code-dicom', authenticate, async (req, res) => {
  return getLanguageDicom(req, res);
})

// View detailed informßation of the blog
app.get('/blog/:urlBlog', authenticate, async (req, res) => {
  return getBlog(req, res);
})

// Remove blog from database
app.delete('/blog/:_id', authenticate, async (req, res) => {
  return deleteBlog(req, res);
})

// Edit blog information in the database
app.put('/update/:blogId', authenticate, async (req, res) => {
  return updateBlog(req, res);
})

app.get('/totalrecords', authenticate, async (req, res) => {
  return getTotalRecords(req, res);
});

app.post(`/avatar`, upload.single('file'), async (req, res) => {
  return uploadAvatar(req, res);
})

app.post(`/imagetitle`, authenticate, upload.single('file'), async (req, res) => {
  return uploadImageTitle(req, res);
})

app.post(`/metaimage`, authenticate, upload.single('file'), async (req, res) => {
  return uploadMetaImage(req, res);
})

app.post(`/content`,authenticate, upload.single('file'), async (req, res) => {
  return uploadImageContent(req, res);
})

app.delete(`/delete-avatar`, authenticate, async (req, res) => {
  return deleteAvatar(req, res);
})

app.delete(`/delete-titleimage`, authenticate, async (req, res) => {
  return deleteImage(req, res);
})

app.delete(`/delete-metaimage`, authenticate, async (req, res) => {
  return deleteImage(req, res);
})


module.exports = app;