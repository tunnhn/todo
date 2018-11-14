const jwt = require('jsonwebtoken');

exports = module.exports = function (io) {
    io.on('connection', socket => {

        function verifyToken(token) {
            return new Promise(function (resolve, reject) {
                jwt.verify(token, 'test', function (err, decode) {
                    err ? reject() : resolve(decode);
                });
            })
        }

        async function getData() {
            const todoGroupModel = require('../models/todo-group');
            const todoItemModel = require('../models/todo-item');
            let groups = await todoGroupModel.find().exec(),
                items = await todoItemModel.find().exec();

            return {
                groups: groups,
                items: items,
                x: 0
            }
        }


        socket.on('login', msg => {
            let {usr, pwd} = msg;

            let AdminUser = require('../models/admin-user');

            AdminUser.findOne({username: usr}, async function (err, user) {
                if (!user) {
                    socket.emit('login failed', 'Invalid username or password!');
                } else {
                    let hasher = require('wordpress-hash-node');
                    let checked = hasher.CheckPassword(pwd, user.password);
                    if (checked) {
                        let u = {username: usr, email: user.email};
                        u.token = jwt.sign(u, 'test');
                        let response = {adminUser: u, todoData: await getData()};
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
                let response = {adminUser: user, todoData: await getData()};

                socket.emit('token-authorized', response);
            }, function (err) {
                socket.emit('token-authorized', err);
            });

            console.log(msg)

        });

        console.log('New user connected')
    });
}
