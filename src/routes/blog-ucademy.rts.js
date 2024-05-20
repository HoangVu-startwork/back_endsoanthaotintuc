const express = require('express');
const app = express()
app.use(express.json());
app.use(express.static('public'));

const {
    getAllBlog,
    getBlog,
    getSitemapsallBlog,
} = require('../controllers/blog-ucademy.ctl')

const {
    getIoBlog,
} = require('../controllers/blog-ucademy-io.ctl')

const {
    getVnBlog
} = require('../controllers/blog-ucademy-vn.ctl')


// Show blog at Ucademy
app.get('/blog-ucademy', async (req, res) => {
    return getAllBlog(req, res);
})

// View detailed information about the blog (create html file when clicking on the blog, 
//the generated file will correspond to the blog when entered)
app.put('/ucademy/:urlBlog', async (req, res) => {
    return getBlog(req, res);
});

app.put('/ucademy-io/:urlBlog', async (req, res) => {
    return getIoBlog(req, res);
})

app.put('/ucademy-vn/:urlBlog', async (req, res) => {
    return getVnBlog(req, res);
})

app.get('/sitemapsall', async (req, res) => {
    return getSitemapsallBlog(req, res)
}) 
module.exports = app;