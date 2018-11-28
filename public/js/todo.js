;(function ($) {

    function createApp() {
        return new Vue({
            el: '#todo-app',
            data: function () {
                return {
                    adminUser: false,
                    errorMsg: '',
                    loaded: false,
                    selectedGroup: -1,
                    defaultTodoData: {
                        items: [],
                        groups: [],
                        noti_0: 0,
                        noti_1: 0,
                        notifications: [],
                        users: [{
                            name: 'Nguyen Ngox Tu'
                        }]
                    },
                    menuItems: [
                        {
                            name: 'Users',
                            cb: '_showPage',
                            id: 'users',
                            icon: 'fas fa-users'
                        },
                        {
                            name: 'Todo',
                            cb: '_showPage',
                            id: 'todo-items',
                            icon: 'fas fa-clipboard-list'
                        },
                        {
                            name: 'No group',
                            cb: '_showPage',
                            id: 'no-group',
                            parent: 'todo-items'
                        }
                    ],
                    currentTime: 0,
                    checkedLogin: true,
                    currentPage: 'todo-items',
                    currentChildPage: '',
                }
            },
            computed: {
                todoData: {
                    get: function () {
                        return this.defaultTodoData;
                    },
                    set: function (v) {
                        this.defaultTodoData = v;
                    }
                },
                countNotis: {
                    get: function () {
                        return this.todoData.notifications ? this.todoData.notifications[1] : 0;
                    }, set: function (v) {
                        this.todoData.notifications[1] = v;
                    }
                },
                notis: function () {
                    return this.todoData.notifications ? this.todoData.notifications[0] : [];
                }
            },
            created: function () {
                this.socket = io();
            },
            mounted: function () {
                var $vm = this;

                $vm.load();
                this.socket.on('logged in', function (response) {
                    $vm.errorMsg = '';
                    $vm.setData(response);
                    $.cookie('todo-authorized-token', response.adminUser.token);

                }).on('login failed', function (msg) {
                    $vm.errorMsg = msg || 'Login failed';
                }).on('token-authorized', function (response) {
                    console.log(response)
                    if ($.isPlainObject(response)) {
                        $vm.setData(response);
                    } else {
                        $vm.checkedLogin = false;
                    }
                }).on('heartbeat', function (time) {
                    $vm.currentTime = time;
                }).on('new-notification', function (noti) {
                    if (noti.user !== $vm.adminUser._id) {
                        //$vm.todoData.notifications.push(noti);
                        Todo.doAjax('notifications/count', {}, 'get').then(function (res) {
                            $vm.todoData.notifications = res.notifications;
                            $vm.todoData.noti_0 = res.noti_0;
                            $vm.todoData.noti_1 = res.noti_1;
                        })
                    }
                    console.log(noti)
                })
                //.on('new user', function (r) {
                //     Todo.dataStore.commit('addUser', r)
                // });

                this.$().addClass('loaded');
            },
            methods: {
                getMenuItems: function () {
                    var items = JSON.parse(JSON.stringify(this.menuItems)),
                        groups = this.todoData.groups,
                        i, n;

                    for (i = 0, n = groups.length; i < n; i++) {
                        items.push(
                            {
                                name: groups[i].name,
                                cb: '_selectGroup',
                                id: groups[i]._id,
                                parent: 'todo-items',
                                counter: [this, 'countItems'],
                                counterArgs: [groups[i]._id],
                                counterColor: groups[i].color
                            }
                        );
                    }

                    return items;
                },
                countItems: function (group) {
                    var allItems = this.todoData.items,
                        count = 0,
                        groups = Todo.listPluck(this.todoData.groups, '_id'),
                        i;

                    if ('' === group) {
                        count = allItems.length;
                    } else {
                        for (i = 0; i < allItems.length; i++) {
                            if ((group && allItems[i].group == group) || ('no-group' === group && (!allItems[i].group || $.inArray(allItems[i].group, groups) === -1))) {
                                count++;
                            }
                        }
                    }
                    return count;
                },
                load: function () {
                    var token = $.cookie('todo-authorized-token');
                    if (token) {
                        this.socket.emit('verify-token', {token: token});
                    } else {
                        this.checkedLogin = false;
                    }


                },
                setData: function (response) {
                    this.loaded = true;
                    this.checkedLogin = true;
                    this.adminUser = response.adminUser;
                    this.todoData = $.extend({}, this.todoData, response.todoData);
                    Todo.ajaxToken = response.adminUser.token;
                    window.Todo.dataStore = window.Todo.createTodoStore(response.todoData);
                },
                countUsers: function () {
                    return (Todo.dataStore.getters['all'].users || []).length;
                },
                isAdmin: function () {
                    console.log(this.adminUser)
                    return this.adminUser && this.adminUser.roles && this.adminUser.roles.find(function (r) {
                            return r === 'administrator';
                        })
                },
                $: function (selector) {
                    return selector ? $(this.$el).find(selector) : $(this.$el);
                },
                _updateAdminUser: function (user) {
                    this.adminUser = user;
                },
                _logout: function (e) {
                    e.preventDefault();
                    this.adminUser = false;
                    this.checkedLogin = false;
                    $.cookie('todo-authorized-token', '');
                },
                _selectGroup: function (group) {
                    this.selectedGroup = group;
                    this.currentPage = 'todo-items';
                },
                _showPage: function (e, page, childPage) {
                    e.preventDefault();
                    this.currentPage = page;
                    this.currentChildPage = childPage;
                },
                _onShowMenuItem: function (id, childId) {
                    this.currentPage = id;
                    this.currentChildPage = childId;
                    //this.selectedGroup = childId;
                },
                $todoStore: function (prop, value) {
                    var $store = window.Todo.dataStore;

                    if (!$store) {
                        return false;
                    }

                    if (prop) {
                        if (arguments.length === 2) {
                            $store.getters[prop] = value;
                        } else {
                            return $store.getters[prop];
                        }
                    }

                    return $store.getters['all'];
                },
            }
        });
    }

    if (window.Todo === undefined) {
        window.Todo = {};
    }

    window.Todo.createApp = createApp;

    $(function () {
        window.Todo.$todo = window.Todo.createApp();
    })
})(jQuery);