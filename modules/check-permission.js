const jwt = require('jsonwebtoken');
let thisToken = 0,
    thisKey = '',
    permission = {
        setToken: function (tk, key) {
            thisToken = tk;
            thisKey = key;
        },
        check: async function (role, resolve, reject) {
            jwt.verify(thisToken || global.token, thisKey || global.tokenKey, function (err, decode) {
                if (err) {
                    return reject && reject(err);
                }

                if (role) {
                    if (!decode.roles) {
                        return reject && reject(err);
                    }

                    if (!decode.roles.find(function (r) {
                            return r === role;
                        })) {
                        return reject && reject(err);
                    }
                }
                resolve && resolve(decode)
            });

        },
        cb: function (role, resolve, reject) {
            return function (req, res, next) {
                permission.check(role, function (data) {
                    if (resolve) {
                        resolve(req, res, next);
                    } else {
                        next();
                    }
                }, function (err) {
                    if (reject) {
                        reject(req, res, next);
                    } else {
                        res.send({error: 'Forbidden access!'});
                    }
                });
            }
        }
    };
exports = module.exports = permission;
//
// exports = module.exports = function (token, key) {
//     key = key || 'todo';
//     return function (a, b, c) {
//         console.log('Check Permission')
//         c();
//     }
//     return function () {
//         jwt.verify(token || global.token, key || global.tokenKey, function (err, decode) {
//             if (err) {
//                 return false;
//             }
//             return decode;
//         });
//
//     };
// }