const jwt = require('jsonwebtoken');
const todoGroupModel = require('../models/todo-group');
const todoItemModel = require('../models/todo-item');
const todoUserModel = require('../models/admin-user');

exports = module.exports = function (io) {
    io.on('connection', socket => {

        //console.log(socket);
        let AdminUser = require('../models/admin-user');

        function verifyToken(token) {
            return new Promise(function (resolve, reject) {
                jwt.verify(token, global.tokenKey, function (err, decode) {
                    err ? reject() : resolve(decode);
                });
            })
        }

        async function getGroupAssignees(group) {
            return [{
                username: Math.random()
            }]
        }

        async function getItemAssignees(group) {
            return [{
                username: Math.random()
            }]
        }

        async function getAssignees(users) {
            return await todoUserModel.find({_id: {$in: users}}).exec();
        }

        async function getData(user) {

            let dataFields = {
                'groups': todoGroupModel.find({user: user._id}),
                'items': todoItemModel.find({
                    $or: [{
                        user: user._id
                    }, {
                        assignees: {$in: user._id}
                    }]
                })
            };

            if (user.roles && user.roles.find(function (r) {
                    return r === 'administrator'
                })) {
                dataFields['users'] = todoUserModel.find({roles: {$nin: [/administrator/]}});
            }

            let all = [];

            for (let i in dataFields) {
                if (dataFields.hasOwnProperty(i)) {
                    all.push(dataFields[i]);
                }
            }

            let data = await Promise.all(all), j = 0;

            for (let i in dataFields) {
                if (dataFields.hasOwnProperty(i)) {
                    dataFields[i] = data[j++];
                }
            }

            if (dataFields['groups']) {
                for (let i = 0; i < dataFields['groups'].length; i++) {
                    dataFields['groups'][i].assignees = await getGroupAssignees(dataFields['groups'][i]._id);
                }
            }

            if (dataFields['items']) {
                for (let i = 0; i < dataFields['items'].length; i++) {
                    let assignees = await getAssignees(dataFields['items'][i].assignees);
                    dataFields['items'][i].assignees = [];
                    for (let j = 0; j < assignees.length; j++) {
                        dataFields['items'][i].assignees.push({
                            _id: assignees[j]._id,
                            email: assignees[j].email,
                            username: assignees[j].username,
                        })
                    }
                }
            }

            return dataFields;
        }

        async function getUserRole(username) {
            let user = await AdminUser.findOne({username: username});

            return user ? user.roles : [];
        }


        socket.on('login', msg => {
            let {usr, pwd} = msg;

            AdminUser.findOne({username: usr}, async function (err, user) {
                if (!user) {
                    socket.emit('login failed', 'Invalid username or password!');
                } else {
                    let hasher = require('wordpress-hash-node');
                    let checked = hasher.CheckPassword(pwd, user.password);
                    if (checked) {
                        let u = {username: usr, email: user.email, _id: user._id, roles: user.roles || []};
                        u.token = jwt.sign(u, global.tokenKey);
                        let response = {adminUser: u, todoData: await getData(user)};
                        //socket.join(u.username);
                        socket.emit('logged in', response);
                    } else {
                        socket.emit('login failed', 'Invalid username or password!');
                    }
                }
            });

        });

        socket.on('verify-token', function (msg) {
            verifyToken(msg.token).then(async function (user) {

                user.token = msg.token;
                user.roles = await getUserRole(user.username);
                let response = {adminUser: user, todoData: await getData(user)};
                socket.join(user.username);
                io.to(user.username).emit('token-authorized', response);
                //socket.emit('token-authorized', response);
            }, function (err) {
                socket.emit('token-authorized', err);
            });

            console.log(msg)

        });

    });
}
