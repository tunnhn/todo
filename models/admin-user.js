const mongoose = require('mongoose');
const db = require('../modules/mongodb');
const Config = require('../modules/config')();

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

    roles: {
        type: Array,
        require: true,
        default: []
    },

    created: {
        type: Date,
        default: Date.now
    }
});
console.log("Prefix = ", Config.get('collectionPrefix', 'DB'))
module.exports = db().model(Config.get('collectionPrefix', 'DB') + 'users', adminUser);