const mongoose = require('mongoose');
const db = require('../modules/mongodb');

const todoGroup = new mongoose.Schema({
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

    color: {
        type: String,
        default: ''
    },

    created: {
        type: Date,
        default: Date.now
    }
})

module.exports = db().model('todo_groups', todoGroup);