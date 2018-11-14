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
                        groups: []
                    },
                    checkedLogin: true
                    //todoData: this.$todoStore()
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
                    if ($.isPlainObject(response)) {
                        $vm.setData(response);
                    } else {
                        $vm.checkedLogin = false;
                    }
                });

                this.$().addClass('loaded');

            },
            methods: {
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
                    this.todoData = response.todoData;
                    window.Todo.dataStore = window.Todo.createTodoStore(response.todoData);
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
                    this.selectedGroup = group
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
})(jQuery);