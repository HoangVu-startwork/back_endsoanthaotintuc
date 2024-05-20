const path = require('path');
const bcrypt = require('bcrypt');
const express = require("express");
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = express();
const Blog = require('../models/blog.models');
const {getBlogByUrl, countBlogView, getBlogDicom, getAllBlogsRecent, getAllBlogByLang, getAllBlogs } = require('../services/blog-dicom')

async function getAllBlogDicom(req, res) {
  try {
    const blogs = await getAllBlogByLang();
    if (!blogs.length) {
      return res.status(404).send('No blog posts found.');
    }
    res.send(blogs);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

async function getAllBlog(req, res) {
  try {
    const lang = req.query.lang;
    if (lang) {
      const blogs = await getBlogDicom(lang)
      res.send(blogs);
    } else {
      const blogs = await getAllBlogs();
      res.send(blogs);
    }
  }catch (error) {
    res.status(500).send('Internal Server Error');
  }
}
async function getBlogUrl(req, res) {
  const blogUrl = req.params.urlBlog;
  try {
    const blog = await getBlogByUrl(blogUrl);
    if (!blog) {return res.status(404).json({ error: 'Blog not found' });}
    const lang = req.headers['language'];
    if (!lang) {return res.json(blog);}
    const { code } = blog;
    const relatedBlogs = await Blog.find({ code, urlBlog: { $ne: blogUrl } });
    const relatedBlogInfo = relatedBlogs.find(blog => blog.language === lang);
    return res.json(relatedBlogInfo || blog);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}
async function count(req, res) {
  const blogId = req.params._id;
  try {
    const foundBlog = await countBlogView(blogId)
    foundBlog.view = (foundBlog.view || 0) + 1;
    await foundBlog.save();
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllRecent(req, res) {
  try {
    let lang = req.query.lang || 'en';
    const blogs = await getAllBlogsRecent(lang);
    if (!blogs.length) {
      return res.status(404).send('No blog posts found.');
    }
    res.send(blogs);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

async function getBlog(req, res) {
  const blogUrl = req.params.urlBlog;
  try {
    const blog = await getBlogByUrl(blogUrl);
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}

module.exports = {
  getBlog,
  count,
  getAllRecent,
  getAllBlogDicom,
  getAllBlog,
  getBlogUrl
}