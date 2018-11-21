const mongoose = require('mongoose');
const db = require('../modules/mongodb');
const Config = require('../modules/config')();

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

    assignees: {
        type: Array,
        default: []
    },

    comments: {
        type: Array,
        default: []
    },

    created: {
        type: Date,
        default: Date.now
    }
})

module.exports = db().model(Config.get('collectionPrefix', 'DB') + 'items', todoItem);