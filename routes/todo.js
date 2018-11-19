const express = require('express');
const todoController = require('../controllers/todo');
const todoGroupModel = require('../models/todo-group');
const todoItemModel = require('../models/todo-item');
const todoUserModel = require('../models/user');
let checkPermission = require('../modules/check-permission');

module.exports = function (app) {
    let router = express.Router(),
        currentUser = false;

    router.use(async function (req, res, next) {
        checkPermission.setToken(app.getRequest('token'), 'todo');

        let currentUser = await checkPermission.check(function () {

        });

        console.log(currentUser);
        next();
    });

    router.post('/add-todo-group', checkPermission.cb(), function (req, res) {
        let data = app.getRequest('group'),
            group = new todoGroupModel(data);

        console.log(group);
        group.save().then(function (r) {
            res.send(r);
        }, function () {
            console.log('error')
        });
    });

    router.post('/add-todo-item', checkPermission.cb(), function (req, res) {
        let data = app.getRequest('item'),
            item = new todoItemModel(data);
        item.save().then(function (r) {
            res.send(r);
        });
    });

    router.get('/remove-todo-group/:group', checkPermission.cb(), function (req, res) {
        let group = app.getRequest('group'),
            removeItems = JSON.parse(app.getRequest('removeItems')),
            removeGroup = function () {
                todoGroupModel.remove({_id: group}).then(function () {
                    res.send({group: group})
                })
            };

        if (removeItems) {

            // Remove items in group being removed and then remove the group
            todoItemModel.remove({group: group}).then(function () {
                removeGroup();
            })
        } else {

            // Move items in group being remove to 'No group' and then remove the group
            todoItemModel.update({group: group}, {group: ''}, {multi: true}, function (err, rows) {
                removeGroup();
            })
        }
    });

    router.get('/remove-todo-item/:item', checkPermission.cb(), function (req, res) {
        let item = app.getRequest('item');

        // Remove items in group being removed and then remove the group
        todoItemModel.remove({_id: item}).then(function () {
            res.send({item: item})
        })

    });

    router.post('/update-todo-group/:id', checkPermission.cb(), function (req, res) {
        todoGroupModel.findById(app.getRequest('id'), function (err, group) {
            if (!group) {
                return new Error('Could not load Document');
            } else {
                var grp = app.getRequest('group');
                for (var i in grp) {
                    if (i === '_id' || !grp.hasOwnProperty(i)) {
                        continue;
                    }

                    group[i] = grp[i];
                }
                group.save(function (err) {
                    if (err)
                        res.send('error')
                    else
                        res.send('success')
                });
            }
        });
    });

    router.post('/update-todo-item/:id', checkPermission.cb(), function (req, res) {
        todoItemModel.findById(app.getRequest('id'), function (err, item) {
            if (!item) {
                return new Error('Could not load Document');
            } else {
                var it = app.getRequest('item');
                for (var i in it) {
                    if (i === '_id' || !it.hasOwnProperty(i)) {
                        continue;
                    }

                    item[i] = it[i];
                }
                item.save(function (err) {
                    if (err)
                        res.send('error')
                    else
                        res.send('success')
                });
            }
        });
    });

    router.post('/update-todo-item-status/:id', checkPermission.cb(), function (req, res) {

        todoItemModel.findById(app.getRequest('id'), function (err, item) {
            if (!item) {
                res.send('error')
            } else {
                var status = app.getRequest('status');
                item.status = status;
                item.save(function (err) {
                    if (err)
                        res.send('error')
                    else
                        res.send('success')
                });
            }
        });

    });

    app.use('/', router);

};