const mongoose = require('mongoose');
const db = require('../modules/mongodb');
const Config = require('../modules/config')();

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

    user: {
        type: String,
        require: true
    },

    assignees: {
        type: Array,
        default: []
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

module.exports = db().model(Config.get('collectionPrefix', 'DB') + 'groups', todoGroup);