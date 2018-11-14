const mongoose = require('mongoose');
const db = require('../modules/mongodb');

const adminUser = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        trim: true
    },

    password: {
        type: String,
        require: true,
    },

    email: {
        type: String,
        require: true
    },

    created: {
        type: Date,
        default: Date.now
    }
})

module.exports = db().model('hackathon_dec_users', adminUser);