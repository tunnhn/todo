const extend = require('extend');
const fs = require('fs');
const ini = require('ini');
const express = require('express');
const Mongoose = require('mongoose');
const Config = require('../modules/config')();

function Installer(app) {
    let self = this;
    this.config = false;
    this.viewPath = viewPath;
    this.config = Config.get() || {};
    this.router = express.Router();

    // this.router.get('/', function (req, res, next) {
    //     res.sendFile(global.viewPath + '/installer.html');
    // });

    this.router.post('/install', function (req, res, next) {
        self.config = req.getRequest('config') || {};
        self.testDb(async function (connection) {
            await self.createCollections(connection);
            self.createConfigFile();
            let user = await self.createAdminUser();
            res.send({message: 'Todo installed successful!', user: user});
        }, function () {
            console.log('error error')
            res.send({errorMsg: 'Unable connect to Mongo Database.'})
        });

    });
}


extend(Installer.prototype, {
    testDb: function (resolve, reject) {
        process.on('SIGINT', () => {
            Mongoose.connection.close(() => {
                console.log('Mongo Database disconnected through app termination')
                process.exit(0)
            })
        })

        let connection = Mongoose
            .createConnection(this.config.mongodb, {});

        connection.on('connected', () => {
            resolve && resolve(connection);
        })

        connection.on('error', (error) => {
            reject && reject();
        });
    },
    createCollections: async function (connection, cb) {
        let collections = ['users', 'groups', 'items'],
            collectionName,
            i, c;
        for (i = 0; i < collections.length; i++) {
            collectionName = this.config.collectionPrefix + collections[i];
            await connection.createCollection(collectionName).then(function (collection) {
                cb && cb(collection, connection)
            });
        }
    },
    createConfigFile: function () {
        let configData = Config.config || {};

        if (!configData.DB) {
            configData.DB = {};
        }

        configData.DB.uri = this.config.mongodb;
        configData.DB.collectionPrefix = this.config.collectionPrefix;
        configData.DB.adminUser = this.config.adminUser;
        configData.DB.adminEmail = this.config.adminEmail;

        if (this.config.MAILER) {
            if (!configData.MAILER) {
                configData.MAILER = {};
            }

            for (var i in this.config.MAILER) {
                if (this.config.MAILER.hasOwnProperty(i)) {
                    configData.MAILER[i] = this.config.MAILER[i];
                }
            }
        }
        fs.writeFileSync(Config.configFile, ini.stringify(configData));

        Config.reload();
    },
    createAdminUser: async function () {
        function generatePassword(password) {
            let hasher = require('wordpress-hash-node');
            return hasher.HashPassword(password);
        }

        let UserModel = require('../models/admin-user'),
            userData = {
                username: this.config.adminUser,
                password: generatePassword(this.config.adminPassword),
                email: this.config.adminEmail,
                roles: ['administrator']
            };


        let user = await UserModel.findOne({username: userData.username});

        if (user) {
            user.password = userData.password;
            user.email = userData.email;
        } else {
            user = new UserModel(userData);
        }

        return await user.save();
    }
});

exports = module.exports = Installer;