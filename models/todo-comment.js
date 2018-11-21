const mongoose = require('mongoose');
const db = require('../modules/mongodb');
const Config = require('../modules/config')();

const todoComment = new mongoose.Schema({
    content: {
        type: String
    },

    status: {
        type: String
    },

    item: {
        type: String,
        require: true
    },

    user: {
        type: String,
        require: true
    },

    created: {
        type: Date,
        default: Date.now
    }
})

module.exports = db().model(Config.get('collectionPrefix', 'DB') + 'comments', todoComment);