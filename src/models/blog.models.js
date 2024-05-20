const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  titleBlog: {
    type: String,
    required: true,
  },
  metaBlog: {
    type: String,
    required: true,
  },
  urlBlog: {
    type: String,
    required: true,
  },
  imgBlog: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  introduce: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  createAt: {
    type: String,
    required: true,
  },
  category: {
    type: Array,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "",
    required: false,
  },
  view: {
    type: Number,
    required: true,
    default: 0,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
}, {
  collection: "NewBlog",
});

const Blog = mongoose.model('NewBlog', blogSchema);

module.exports = Blog;
