const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const Config = require('../modules/config')();
const indexPage = require('../modules/index-page');

module.exports = function (app) {
    let router = express.Router(),
        currentUser = false;

    app.get('/todo-installer', function (req, res, next) {
        res.send(ejs.render(fs.readFileSync(global.viewPath + '/installer.html').toString(), {
            config: {
                rootUrl: req.protocol + '://' + req.get('host')
            }
        }));
    });

    app.get('/', function (req, res, next) {
        res.send(indexPage());
    })

    // Combine js files
    app.get('/js/todo-components', function (req, res, next) {
        let fs = require('fs'),
            components = ['base', 'authentication', 'users', 'groups', 'item-users', 'items', 'group-users', 'comments'],
            code = '',
            i, n = components.length,
            rootPath = require('path').dirname(__dirname);

        for (i = 0; i < n; i++) {
            code += fs.readFileSync(rootPath + '/public/js/components/' + components[i] + '.js') + "\n\n";
        }
        res.header('Content', 'application/javascript');
        res.send(';(function ($) {' + code + '})(jQuery);');
    })
}