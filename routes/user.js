const express = require('express');
const todoController = require('../controllers/todo');
const todoUserModel = require('../models/user');
let checkPermission = require('../modules/check-permission');
const Config = require('../modules/config')();
let hasher = require('wordpress-hash-node');
const UserModule = require('../modules/user')();
function generatePassword(password) {

    return hasher.HashPassword(password);
}


module.exports = function (app) {
    let router = express.Router(),
        permission = {
            a: 0,
            load: function (a) {
                this.a = a;
            },
            check: function (req, res, next) {
                console.log('This=', this, this.a)
                next();
            }
        }
    app.use(function (req, res, next) {
        next();
    });

    router.post('/register', function (req, res, next) {
        let userData = req.getRequest('user'),
            user = new todoUserModel(userData);
        todoUserModel.findOne({$or: [{username: user.username}, {email: user.email}]}, function (r, existsUser) {

            if (existsUser) {
                res.send({error: 'User or email exists'});
            } else {
                user.password = generatePassword(user.password);
                user.save().then(function (r) {
                    let mailer = require('../modules/mailer')({
                        to: user.email,
                        subject: 'Welcome to Todo',
                        html: 'You have registered to Todo successful.'
                    }).send().then(function () {
                        console.log('Sent')
                    }, function (error) {
                        console.log('Send mail error:', error)
                    });

                    app.io.emit('new user', r);
                    res.send(r);
                });
            }
        });
    });

    router.get('/check-exists', function (req, res, next) {
        let args = {};

        args[req.getRequest('field')] = req.getRequest('value');

        todoUserModel.findOne(args, function (r, user) {

            let json = {exists: false};
            if (user) {
                json.exists = true;
            }
            res.send(json);
        });
    });

    router.get('/remove-user/:user', checkPermission.cb('administrator'), function (req, res) {
        let user = app.getRequest('user');

        // Remove items in group being removed and then remove the group
        todoUserModel.remove({_id: user}).then(function () {
            res.send({user: user})
        })

    });

    router.get('/get-user-data/:user', checkPermission.cb(), async function (req, res) {
        let user = app.getRequest('user');

        // Remove items in group being removed and then remove the group
        res.send(await
            UserModule.getData(user)
        )
    })

    app.use(router);
}