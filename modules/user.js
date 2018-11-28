const todoUserModel = require('../models/user');
const todoGroupModel = require('../models/todo-group');
const todoItemModel = require('../models/todo-item');
const todoNotificationModel = require('../models/todo-notification');
let AdminUser = require('../models/admin-user');

exports = module.exports = function () {
    async function getNotifications(userId) {
        let items = await todoItemModel.find({
            $or: [{user: userId}, {assignees: {$in: userId}}]
        }), i, n, itemIds = [], notifications;

        if (items) {
            for (i = 0, n = items.length; i < n; i++) {
                itemIds.push(items[i]._id.toString());
            }

            notifications = await todoNotificationModel.find({
                $or: [{object: {$in: itemIds}}, {objectParent: {$in: itemIds}}],
                user: {$nin: userId}
            });

            return notifications;
        }

        return [];
    }

    async function getData(user) {
        let userId = user._id.toString();
        let dataFields = {
            'groups': todoGroupModel.find({user: userId}),
            'items': todoItemModel.find({
                $or: [{
                    user: userId
                }, {
                    assignees: {$in: userId}
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

        // if (dataFields['groups']) {
        //     for (let i = 0; i < dataFields['groups'].length; i++) {
        //         dataFields['groups'][i].assignees = await getGroupAssignees(dataFields['groups'][i]._id);
        //     }
        // }

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

        dataFields['notifications'] = await getNotifications(userId);
        dataFields['noti_0'] = user.noti_0;
        dataFields['noti_1'] = user.noti_1;

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
            return await getData(user);
        }
        return false;
    }

    this.getUserRole = getUserRole;
    this.getNotifications = getNotifications;

    return this;
}