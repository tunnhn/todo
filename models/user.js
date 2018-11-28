const mongoose = require('mongoose');
const db = require('../modules/mongodb');
const Config = require('../modules/config')();
const adminUser = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true
    },

    lastName: {
        type: String,
        trim: true
    },

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

    roles: {
        type: Array,
        require: true,
        default: []
    },

    noti_0: {
        type: Number
    },

    noti_1: {
        type: Number
    },

    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = db().model(Config.get('collectionPrefix', 'DB') + 'users', adminUser);