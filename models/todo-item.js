const mongoose = require('mongoose');
const db = require('../modules/mongodb');

const todoItem = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },

    desc: {
        type: String,
        require: true,
    },

    order: {
        type: Number,
        default: 1
    },

    expiredDate: {
        type: String,
        default: ''
    },

    group: {
        type: String
    },

    status: {
        type: String
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

module.exports = db().model('todo_items', todoItem);