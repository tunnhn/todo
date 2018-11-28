let ejs = require('ejs'),
    fs = require('fs'),
    Config = require('../modules/config')();

exports = module.exports = function () {

    var index = fs.readFileSync(viewPath + '/index.html'),
        authentication = fs.readFileSync(viewPath + '/components/authentication.html'),
        todoGroups = fs.readFileSync(viewPath + '/components/todo-groups.html'),

        ///
        todoItems = fs.readFileSync(viewPath + '/components/todo-items.html'),
        todoItemUsers = fs.readFileSync(viewPath + '/components/todo-item-users.html'),
        todoEditForm = fs.readFileSync(viewPath + '/components/todo-edit-form.html'),
        comments = fs.readFileSync(viewPath + '/components/comments.html'),
        todoMenu = fs.readFileSync(viewPath + '/components/menu.html'),
        jsConfig = fs.readFileSync(viewPath + '/js.html'),

        //
        todoUsers = fs.readFileSync(viewPath + '/components/todo-users.html');

    return ejs.render(index.toString(), {
        baseUrl: Config.get('url', 'SERVER'),
        jsConfig: ejs.render(jsConfig.toString(), {
            config: {
                rootUrl: Config.get('url', 'SERVER'),
            },
        }),
        components: {
            authentication: authentication,
            todoMenu: todoMenu,
            todoGroups: todoGroups,
            todoItems: ejs.render(todoItems.toString(), {
                components: {
                    todoItemUsers: todoItemUsers,
                    todoEditForm: todoEditForm,
                    todoComments: comments,
                }
            }),
            todoUsers: todoUsers
        }
    });
}