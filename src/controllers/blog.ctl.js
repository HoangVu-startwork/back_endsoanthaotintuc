const path = require('path');
const bcrypt = require('bcrypt');
const express = require("express");
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = express();
const { S3 } = require("@aws-sdk/client-s3");
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
app.use(express.static('public'));
const Blog = require('../models/blog.models');
const { deleteBlogById, getBlogByUrl, uploadImage, avatar, imageContent, deleteAvatarImage, deleteImageblog } = require('../services/upload')
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

async function create(req, res) {
    try {
        const newBlogData = req.body;
        const newBlog = new Blog(newBlogData);
        const { urlBlog } = newBlogData;
        const isExistedBlog = await validateUrlBlog(urlBlog);
        if (isExistedBlog.duplicate) {
            res.status(409).json({
                success: false,
                message: 'URL already exists',
            });
            return;
        }
        await newBlog.save();
        res.status(201).json({
            success: true,
            message: 'Successfully added blog',
            data: newBlog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

async function validateUrlBlog(urlBlog) {
    try {
        const isExistedBlog = await Blog.findOne({ urlBlog });

        if (isExistedBlog) {
            return { duplicate: true };
        } else {
            return { duplicate: false };
        }
    } catch (error) {
        return { error: error.message };
    }
}

// list of blogs of the blog editor
// Use the lean() function to return a raw JavaScript object
//Added search by name and by site (dicom vs ucademy)

async function getAllBlogs(req, res) {
    const page = parseInt(req.query.page) || 1;
    const minLimit = 9;
    const skip = (page - 1) * minLimit;
    try {
        const title = req.query.title || '';
        const location = req.query.location || '';
        const query = {};
        if (title) {query.titleBlog = { $regex: title, $options: 'i' };}
        if (location) {query.location = location;}
        // Fetch total number of blogs using estimatedDocumentCount() for performance
        const totalBlogs = await Blog.countDocuments(query);
        // Calculate the limit dynamically based on the total number of blogs
        const dynamicLimit = Math.max(minLimit, Math.ceil(totalBlogs / (page * minLimit)));
        // Fetch blogs using the dynamically calculated limit
        const blogsResult = await Blog.find(query)
            .skip(skip)
            .limit(dynamicLimit)
            .sort({ datecreated: -1 })
            .lean();
        // Recalculate the total number of pages based on the dynamic limit
        const totalPages = Math.ceil(totalBlogs / dynamicLimit);
        // Calculate pagination start and end pages
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 3);
        }
        // Respond with the fetched blogs and pagination information
        res.send({ blogs: blogsResult, currentPage: page, totalPages, startPage, endPage,});
    } catch (error) {
        res.status(500).send(error);
    }
}
async function getTotalRecords(req, res) {
    try {
        const totalRecords = await Blog.countDocuments();
        const totalDicomRecords = await Blog.countDocuments({ location: process.env.DICOM });
        const totalUcademyRecords = await Blog.countDocuments({ location: process.env.UCADEMY });
        res.json({
            totalRecords,
            totalDicomRecords,
            totalUcademyRecords,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred.' });
    }
}
async function getCode(req, res) {
    try {
        const { createAt } = req.query;
        let query = {};

        // Check if createAt parameter has been passed
        if (createAt) {
            query = { code: createAt };
        }

        // Get data from database based on createAt parameter
        const data = await Blog.find(query);

        // Create a Map object to store unique records based on the "ms" field
        const uniqueDataMap = new Map();

        // Loop through data from the database
        data.forEach(item => {
            // Check if the location is "ucademy"
            if (item.location === process.env.UCADEMY) {
                // Add to uniqueDataMap only if the location is "ucademy"
                if (!uniqueDataMap.has(item.code)) {
                    uniqueDataMap.set(item.code, item);
                }
            }
        });

        // Convert unique values from Map to array
        const uniqueData = Array.from(uniqueDataMap.values());
        res.send(uniqueData);
    } catch (error) {
        res.status(500).send(error);
    }
}

async function getLanguageDicom(req, res) {
    try {
        const { createAt } = req.query;
        let query = {};

        // Check if createAt parameter has been passed
        if (createAt) {
            query = { code: createAt };
        }

        // Get data from database based on createAt parameter
        const data = await Blog.find(query);

        // Create a Map object to store unique records based on the "ms" field
        const uniqueDataMap = new Map();

        // Loop through data from the database
        data.forEach(item => {
            // Check if the location is "ucademy"
            if (item.location === process.env.DICOM) {
                // Add to uniqueDataMap only if the location is "ucademy"
                if (!uniqueDataMap.has(item.code)) {
                    uniqueDataMap.set(item.code, item);
                }
            }
        });

        // Convert unique values from Map to array
        const uniqueData = Array.from(uniqueDataMap.values());
        res.send(uniqueData);
    } catch (error) {
        res.status(500).send(error);
    }
}


async function getBlog(req, res) {
    const blogUrl = req.params.urlBlog;
    try {
        const blog = await getBlogByUrl(blogUrl);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

async function deleteBlog(req, res) {
    try {
        const _id = req.params._id;
        await deleteBlogById(_id);
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

async function updateBlog(req, res) {
    try {
        const blogId = req.params.blogId;
        const updateData = {};

        // Loop through the properties in the request body and add them to the updateData object
        for (const key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                updateData[key] = req.body[key];
            }
        }
        const blog = await Blog.findOneAndUpdate({ _id: blogId }, updateData, { new: true });

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        res.json({ success: true, message: 'Blog updated successfully', data: blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


const uploadAvatar = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const fileName = req.query.fileName;
    avatar(req.file, fileName)
        .then(imageLocation => {
            res.status(200).json({ message: 'File uploaded successfully.', imageUrl: imageLocation });
        })
        .catch(error => {
            res.status(500).json({ error: error });
        });
};

const uploadImageTitle = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const fileName = req.query.fileName;
    uploadImage(req.file, fileName)
        .then(imageLocation => {
            res.status(200).json({ message: 'File uploaded successfully.', imageUrl: imageLocation });
        })
        .catch(error => {
            res.status(500).json({ error: error });
    });
};

const uploadMetaImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const fileName = req.query.fileName;
    uploadImage(req.file, fileName)
        .then(imageLocation => {
            res.status(200).json({ message: 'File uploaded successfully.', imageUrl: imageLocation });
        })
        .catch(error => {
            res.status(500).json({ error: error });
        });
};

const uploadImageContent = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    imageContent(req.file)
        .then(imageLocation => {
            res.status(200).json({ message: 'File uploaded successfully.', imageUrl: imageLocation });
        })
        .catch(error => {
            res.status(500).json({ error: error });
        });
};

const deleteAvatar = async (req, res) => {
    const imageKey = req.query.imageKey;
    try {
        const message = await deleteAvatarImage(imageKey);
        res.status(200).json({ message: message });
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

const deleteImage = async (req, res) => {
    const imageKey = req.query.imageKey;
    try {
        const message = await deleteImageblog(imageKey);
        res.status(200).json({ message: message });
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

module.exports = {
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
};