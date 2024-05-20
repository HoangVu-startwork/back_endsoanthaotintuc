const User = require('../models/user.models');

async function getUserByEmail(email) {
    try {
        return await User.findOne({ email: email })
    } catch (error) {
        return error
    }
}

async function getUserById(userId, token) {
    try {
        return await User.findOne({  _id: userId, token: token })
    } catch (error) {
        return error
    }
}

async function getUserId(userId) {
    try {
        return await User.findOne({  _id: userId})
    } catch (error) {
        return error
    }
}

async function deleteUserEmail(email) {
    try {
      return await User.findOneAndDelete({ email: email});
    } catch (error) {
      return error
    }
  }

module.exports = {
    getUserByEmail,
    getUserById,
    getUserId,
    deleteUserEmail
}