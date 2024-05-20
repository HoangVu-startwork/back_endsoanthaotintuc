const express = require('express');
const app = express()
app.use(express.json());

const {
    getBlog,
    count,
    getAllRecent,
    getAllBlogDicom,
    getAllBlog,
    getBlogUrl
} = require('../controllers/blog-dicom.ctl')

// Display blog information in Dicom

app.get('/blog-dicom', (req, res) => {
   return getAllBlogDicom(req, res);
})

app.get('/blog-dicom-all', (req, res) => {
    return getAllBlog(req, res)
})

app.get('/dicom-recent', (req, res) => {
    return getAllRecent(req, res);
})

app.put('/readcount/:_id', async (req, res) => {
    return count(req, res);
})

// View detailed information of the blog
app.get('/blog-dicom/:urlBlog', async (req, res) => {
    return getBlog(req, res);
})

app.get('/blog-dicom-all/:urlBlog', (req, res) => {
    return getBlogUrl(req, res)
})

module.exports = app;