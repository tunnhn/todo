const jwt = require('jsonwebtoken');
const todoGroupModel = require('../models/todo-group');
const todoItemModel = require('../models/todo-item');
const todoUserModel = require('../models/admin-user');
const UserModule = require('../modules/user')();

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
                        let response = {adminUser: u, todoData: await UserModule.getData(user)};
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
                user.roles = await UserModule.getUserRole(user.username);
                let response = {adminUser: user, todoData: await UserModule.getData(user)};
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
