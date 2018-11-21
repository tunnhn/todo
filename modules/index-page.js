let ejs = require('ejs'),
    fs = require('fs'),
    Config = require('../modules/config')();

exports = module.exports = function () {

    var htmls = [
        fs.readFileSync(viewPath + '/index.html'),
        fs.readFileSync(viewPath + '/components/authentication.html'),
        fs.readFileSync(viewPath + '/components/todo-groups.html'),

        ///
        fs.readFileSync(viewPath + '/components/todo-items.html'),
        fs.readFileSync(viewPath + '/components/todo-item-users.html'),
        fs.readFileSync(viewPath + '/components/todo-edit-form.html'),
        fs.readFileSync(viewPath + '/components/comments.html'),

        //
        fs.readFileSync(viewPath + '/components/todo-users.html')
    ];

    return ejs.render(htmls[0].toString(), {
        baseUrl: Config.get('url', 'SERVER'),
        config: {
            rootUrl: Config.get('url', 'SERVER'),

        },
        components: {
            authentication: htmls[1],
            todoGroups: htmls[2],
            todoItems: ejs.render(htmls[3].toString(), {
                components: {
                    todoItemUsers: htmls[4],
                    todoEditForm: htmls[5],
                    todoComments: htmls[6],
                }
            }),
            todoUsers: htmls[7]
        }
    });
}