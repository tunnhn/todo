const express = require('express');
const todoController = require('../controllers/todo');
const todoGroupModel = require('../models/todo-group');
const todoItemModel = require('../models/todo-item');
let checkPermission = require('../modules/check-permission');

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
        ///permission = checkPermission(global.token);
        ///console.log('Permission:', checkPermission);
        //////router.get('/get-todo-data', permission, todoController.getData);
        checkPermission.setToken(app.getRequest('token', 'todo'));//.load(12,34);
        ///permission.check();
        next();
    });

    router.post('/update-todo-item-status/:id', checkPermission.cb(function (a, b, c) {
        console.log('Verified');
        c();
    }), function (req, res, next) {
        res.send('Cool')
        ///next();
    });

    // router.post('/update-todo-item-status/:id', checkPermission.cb(function (a, b, c) {
    //     console.log('Tu ba');
    //     c();
    // }), function (req, res) {
    //     console.log('X', permission)
    //     ///res.send('');
    // });

    router.post('/add-todo-group', function (req, res) {
        let data = app.getRequest('group'),
            group = new todoGroupModel(data);
        group.save().then(function (r) {
            res.send(r);
        });
    });

    router.post('/add-todo-item', function (req, res) {
        let data = app.getRequest('item'),
            item = new todoItemModel(data);
        item.save().then(function (r) {
            res.send(r);
        });
    });

    router.get('/remove-todo-group/:group', function (req, res) {
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

    router.get('/remove-todo-item/:item', function (req, res) {
        let item = app.getRequest('item');

        // Remove items in group being removed and then remove the group
        todoItemModel.remove({_id: item}).then(function () {
            res.send({item: item})
        })

    });

    router.post('/update-todo-group/:id', function (req, res) {
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

    router.post('/update-todo-item/:id', function (req, res) {
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

    router.post('/update-todo-item-status/:id', function (req, res) {

        console.log('id', app.getRequest('id'))

        todoItemModel.findById(1234, function (err, item) {


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