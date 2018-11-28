const mongoose = require('mongoose');
const db = require('../modules/mongodb');
const Config = require('../modules/config')();

const todoItem = new mongoose.Schema({
    user: {
        type: String,
        require: true,
        trim: true
    },

    object: {
        type: String,
        require: true
    },

    objectType: {
        type: String,
        require: true
    },

    objectParent: {
        type: Array
    },

    content: {
        type: String
    },

    receivers: {
        type: Array
    },

    status: {
        type: String
    },

    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = db().model(Config.get('collectionPrefix', 'DB') + 'notifications', todoItem);