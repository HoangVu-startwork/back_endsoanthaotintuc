const Blog = require('../models/blog.models');
const { STATUS } = require('../config/blog');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

async function countBlogView(blogId) {
    try {
        return await Blog.findById(blogId)
    } catch (error) {
        return error
    }
}

async function getAllBlogs() {
    try {
        const status = STATUS.public;
        return await Blog.find({ location: process.env.DICOM, status}).sort({ createAt: -1 });
    } catch (error) {
        throw error;
    }
}
async function getBlogByUrl(blogUrl) {
    try {
        return await Blog.findOne({ urlBlog: blogUrl }).lean();
    } catch (error) {
        return error
    }
}

async function getBlogDicom(lang) {
    try {
        const status = STATUS.public;
        return await Blog.find({ location: process.env.DICOM, language: lang, status}).sort({ createAt: -1 });
    } catch (error) {
        throw error;
    }
}

async function getAllBlogByLang() {
    try {
        const status = STATUS.public;
        return await Blog.find({ location: process.env.DICOM, status})
            .sort({ createAt: -1 });
    } catch (error) {
        throw error;
    }
}

async function getAllBlogsRecent(lang) {
    try {
        const status = STATUS.public;
        return await Blog.find({ location: process.env.DICOM, status, language: lang })
            .sort({ createAt: -1 })
            .limit(5);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getBlogByUrl,
    countBlogView,
    getAllBlogsRecent,
    getAllBlogByLang,
    getAllBlogs,
    getBlogDicom
}