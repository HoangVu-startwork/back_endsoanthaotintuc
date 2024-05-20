const Blog = require('../models/blog.models');
const AWS = require('aws-sdk');
const { s3, filehtml } = require('../config/aws');
const { Code } = require('mongodb');

async function getBlogByUrl(blogUrl) {
  try {
    return await Blog.findOne({ urlBlog: blogUrl })
  } catch (error) {
    return error
  }
}

async function deleteBlogById(_id) {
  try {
    return await Blog.findByIdAndDelete(_id);
  } catch (error) {
    return error
  }
}
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

async function avatar(file, fileName) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: `${process.env.BUCKET_NAME}/blog/user`,
      Key: fileName,
      ContentType: file.mimetype,
      Body: file.buffer,
      ACL: 'public-read',
    };

    s3.upload(params, (error, data) => {
      if (error) {
        reject('Failed to upload file.');
      } else {
        resolve(data.Location);
      }
    });
  });
};

async function deleteAvatarImage(imageKey) {
  return new Promise(async (resolve, reject) => {
    const key = imageKey.substring(imageKey.lastIndexOf('/') + 1);
    const params = {
      Bucket: `${process.env.BUCKET_NAME}/blog/user`,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
      resolve('Image deleted successfully');
    } catch (error) {
      reject('An error occurred while deleting the image');
    }
  });
};

async function uploadImage(file, fileName) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: `${process.env.BUCKET_NAME}/blog/images`,
      Key: fileName,
      ContentType: file.mimetype,
      Body: file.buffer,
      ACL: 'public-read',
    };
    s3.upload(params, (error, data) => {
      if (error) {
        reject('Failed to upload file.');
      } else {
        resolve(data.Location);
      }
    });
  });
};

async function imageContent(file) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: `${process.env.BUCKET_NAME}/blog/images`,
      Key: file.originalname,
      ContentType: file.mimetype,
      Body: file.buffer,
      ACL: 'public-read',
    };

    s3.upload(params, (error, data) => {
      if (error) {
        reject('Failed to upload file.');
      } else {
        resolve(data.Location);
      }
    });
  });
};

async function deleteImageblog(imageKey) {
  return new Promise(async (resolve, reject) => {
    const key = imageKey.substring(imageKey.lastIndexOf('/') + 1);
    const params = {
      Bucket: `${process.env.BUCKET_NAME}/blog/images`,
      Key: key,
    };
    try {
      await s3.deleteObject(params).promise();
      resolve('Image deleted successfully');
    } catch (error) {
      reject('An error occurred while deleting the image');
    }
  });
};

module.exports = {
  getBlogByUrl,
  deleteBlogById,
  uploadImage,
  avatar,
  imageContent,
  deleteAvatarImage,
  deleteImageblog,
}