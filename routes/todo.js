const express = require('express');
const todoGroupModel = require('../models/todo-group');
const todoItemModel = require('../models/todo-item');

module.exports = function (app) {
    let router = express.Router();

    router.get('/get-todo-data', async function (req, res) {
        async function getData() {
            let groups = await todoGroupModel.find().exec(),
                items = await todoItemModel.find().exec();

            return {
                groups: groups,
                items: items,
                x: 0
            }
        }

        let data = await getData();
        res.send(data)
    });

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
        todoItemModel.findById(app.getRequest('id'), function (err, item) {
            if (!item) {
                return new Error('Could not load Document');
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