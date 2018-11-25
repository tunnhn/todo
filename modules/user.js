const todoUserModel = require('../models/user');
const todoGroupModel = require('../models/todo-group');
const todoItemModel = require('../models/todo-item');
let AdminUser = require('../models/admin-user');

exports = module.exports = function () {
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

    async function getAssignees(users) {
        return await todoUserModel.find({_id: {$in: users}}).exec();
    }

    this.getData = async function (userId) {
        let user = await todoUserModel.findOne({_id: userId}).exec();
        if (user) {
            return await getData({_id: user._id.toString(), roles: user.roles});
        }
        return false;
    }

    this.getUserRole = getUserRole;

    return this;
}