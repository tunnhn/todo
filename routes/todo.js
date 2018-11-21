const express = require('express');
const todoController = require('../controllers/todo');
const todoGroupModel = require('../models/todo-group');
const todoItemModel = require('../models/todo-item');
const todoUserModel = require('../models/user');
const todoCommentModel = require('../models/todo-comment');
const indexPage = require('../modules/index-page');
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

    router.post('/add-todo-group', checkPermission.cb('administrator'), function (req, res) {
        let data = app.getRequest('group'),
            group = new todoGroupModel(data);

        console.log(group);
        group.save().then(function (r) {
            res.send(r);
        }, function () {
            console.log('error')
        });
    });

    router.post('/add-todo-item', checkPermission.cb('administrator'), function (req, res) {
        let data = app.getRequest('item'),
            item = new todoItemModel(data);
        item.save().then(function (r) {
            res.send(r);
        });
    });

    router.get('/remove-todo-group/:group', checkPermission.cb('administrator'), function (req, res) {
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

    router.get('/remove-todo-item/:item', checkPermission.cb('administrator'), function (req, res) {
        let item = app.getRequest('item');

        // Remove items in group being removed and then remove the group
        todoItemModel.remove({_id: item}).then(function () {
            res.send({item: item})
        })

    });

    router.post('/update-todo-group/:id', checkPermission.cb('administrator'), function (req, res) {
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

    router.post('/update-todo-item/:id', checkPermission.cb('administrator'), function (req, res) {
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

    router.post('/update-todo-item-status/:id', checkPermission.cb('administrator'), function (req, res) {

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

    router.get('/assign-user-to-item/:id/:username', checkPermission.cb('administrator'), async function (req, res) {
        let itemId = app.getRequest('id'),
            username = app.getRequest('username');

        if (!itemId || !username) {
            return res.send({error: 'Invalid item or user'});
        }

        let data = await Promise.all([todoItemModel.findOne({_id: itemId}), todoUserModel.findOne({username: username})]);

        if (!data[0] || !data[1]) {
            return res.send({error: 'Invalid item or user'});
        }

        if (data[0].user == data[1]._id) {
            return res.send({error: 'User is owner of the item'})
        }

        if (!data[0].assignees) {
            data[0].assignees = [data[1]._id.toString()];
        } else {
            if (-1 === data[0].assignees.findIndex(function (a) {
                    return a.toString() == data[1]._id.toString();
                })) {
                data[0].assignees.push(data[1]._id.toString());
            }
        }
        data[0].save(function () {
            res.send('what is the hell')
        });
    });

    router.get('/load-item-comments/:id', checkPermission.cb(), async function (req, res) {
        console.time('x')
        let itemId = app.getRequest('id');
        let data = await Promise.all([todoItemModel.findOne({_id: itemId})/*, todoUserModel.findOne({username: commentData.username})*/]);

        if (!data[0]) {
            return res.send({error: 'Bad Request!'});
        }

        async function fetchUsers(comments) {
            let users = {};
            for (var i = 0; i < comments.length; i++) {
                users[comments[i].user] = comments[i].user;
            }
            let returnComments = [];
            users = await Promise.all([todoUserModel.find({_id: {$in: Object.values(users)}})]);
            for (var i = 0; i < comments.length; i++) {

                for (var j = 0; j < users[0].length; j++) {
                    if (comments[i].user.toString() == users[0][j]._id.toString()) {
                        returnComments.push(JSON.parse(JSON.stringify(comments[i])))
                        returnComments[i].user = {
                            _id: users[0][j]._id,
                            username: users[0][j].username,
                            email: users[0][j].email
                        }
                    }
                }
            }

            return returnComments;
        }

        let comments = await todoCommentModel.find({item: itemId}).exec();
        if (comments) {
            comments = await fetchUsers(comments);
        }
        console.timeEnd('x')


        res.send(comments)
    });

    router.post('/add-item-comment/:id', checkPermission.cb(), async function (req, res) {
        let itemId = app.getRequest('id'),
            commentData = app.getRequest('comment');

        if (!itemId || !commentData) {
            return res.send({error: 'Bad request'});
        }

        let data = await Promise.all([todoItemModel.findOne({_id: itemId}), todoUserModel.findOne({username: commentData.username})]);

        if (!data[0] || !data[1]) {
            return res.send({error: 'Invalid item or user'});
        }

        commentData.user = data[1]._id;
        commentData.item = itemId;

        let comment = new todoCommentModel(commentData);
        comment.save(function () {
            commentData = JSON.parse(JSON.stringify(comment));
            commentData.user = {
                _id: data[1]._id,
                username: data[1].username,
                email: data[1].email
            }
            app.io.emit('comment-added', commentData);
            //s.emit('comment-added', commentData);
            res.send(commentData);
        });
    });

    app.get('/t/:group/?(/:item)?', async function (req, res, next) {
        console.time('index');
        var html = await indexPage();
        console.timeEnd('index')
        res.send(html)
    });

    app.use('/', router);

};