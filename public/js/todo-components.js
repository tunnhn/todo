;(function ($) {
    var baseMethods = {
        $: function (selector) {
            return selector ? $(this.$el).find(selector) : $(this.$el);
        }
    }

    Vue.component('authentication', {
        props: ['adminUser'],
        data: function () {
            return {
                message: '',
                loginAuth: {
                    usr: '',
                    pwd: ''
                },
                registerAccount: {},
                screen: 'login'
            }
        },
        watch: {
            'registerAccount.email': Todo.debounce(function (email) {
                var $vm = this;
                this.checkExists('email', email).then(function () {
                    $vm.message = false;
                }, function () {
                    $vm.message = ['Email is already exists', 'error']
                })
            }, 300),
            'registerAccount.username': Todo.debounce(function (username) {
                var $vm = this;
                this.checkExists('username', username).then(function () {
                    $vm.message = false;
                }, function () {
                    $vm.message = ['Username is already exists', 'error']
                });
            }, 300)
        },
        computed: {},
        mounted: function () {
            var $vm = this;

            this.$root.socket.on('login failed', function (errorMsg) {
                $vm.message = errorMsg;
            }).on('logged in', function (u) {
                this.emit('update-admin-user', u);
            });

            this.$('#todo-register').on('keyup', 'input', function () {
                $vm.message = false;
            })
        },
        methods: $.extend({}, baseMethods, {
            checkExists: function (field, value) {
                return new Promise(function (resolve, reject) {
                    Todo.doAjax('check-exists', {
                        field: field,
                        value: value
                    }).then(function (r) {
                        if (!r.exists) {
                            resolve(r);
                        } else {
                            reject(r)
                        }
                    });
                })
            },
            getMessage: function () {
                if (!this.message) {
                    return false;
                }

                if (typeof this.message === 'string') {
                    return this.message;
                }

                if ($.isArray(this.message)) {
                    return this.message[0];
                }

                return this.message.content;
            },
            getMessageClass: function () {
                if (!this.message) {
                    return '';
                }

                if ($.isPlainObject(this.message)) {
                    return this.message.type || 'success';
                }

                if ($.isArray(this.message)) {
                    return this.message[1] || 'success';
                }

                return 'success';
            },
            validate: function () {
                if (!this.registerAccount.firstName) {
                    this.message = ['Please enter your first name', 'error'];
                    this.$('[name="reg-firstName"]').focus();
                    return false;
                }

                if (!this.registerAccount.lastName) {
                    this.message = ['Please enter your last name', 'error'];
                    this.$('[name="reg-lastName"]').focus();
                    return false;
                }

                if (!Todo.validateEmail(this.registerAccount.email)) {
                    this.message = ['Please enter your email', 'error'];
                    this.$('[name="reg-email"]').focus();
                    return false;
                }

                if (!this.registerAccount.username) {
                    this.message = ['Please enter your username', 'error'];
                    this.$('[name="reg-username"]').focus();
                    return false;
                }

                if (!this.registerAccount.password) {
                    this.message = ['Please enter your password', 'error'];
                    this.$('[name="reg-password"]').focus();
                    return false;
                }
                this.message = false;
                return true;
            },
            _showForm: function (e, screen) {
                e.preventDefault();
                this.screen = screen;
            },
            _login: function () {
                this.$root.socket.emit('login', this.loginAuth);
            },
            _register: function () {
                if (!this.validate()) {
                    return;
                }
                Todo.doAjax('register', {
                    user: this.registerAccount
                }, 'post').then(function (r) {
                    console.log(r)
                })
            },
            _maybeLogin: function (e) {
                if (e.keyCode == 13) {
                    this._login();
                }
            },
            _maybeRegister: function (e) {
                if (e.keyCode == 13) {
                    this._register();
                }
            }
        })
    });

    Vue.component('todo-users', {
        props: ['todoData'],

        methods: {
            getUserNiceName: function (user) {
                return user.firstName + ' ' + user.lastName;
            },
        }
    });

    Vue.component('todo-groups', {
        props: ['todoData', 'selectedGroup', 'adminUser'],
        data: function () {
            return {
                group: false,
                errorMsg: ''
            }
        },
        watch: {
            group: function (group, oldGroup) {
                if (group !== false && oldGroup === false) {
                    setTimeout(function ($vm) {
                        $vm.$('.todo__group-name').focus();
                    }, 10, this);
                }
            }
        },
        computed: {
            todoGroups: function () {
                return this.todoData.groups || [];
            },
            todoItems: function () {
                return this.todoData.items || []
            }
        },
        mounted: function () {
            var $vm = this;
            this.$('.color').each(function () {
                var $input = $(this);

                $input.ColorPicker({
                    color: '#0000ff',
                    onShow: function (colpkr) {
                        $(colpkr).fadeIn(500);
                        return false;
                    },
                    onHide: function (colpkr) {
                        $(colpkr).fadeOut(500);
                        return false;
                    },
                    onChange: function (hsb, hex, rgb) {
                        $input.val('#' + hex);
                        //Todo.fireNativeEvent($input[0], 'change');
                        Vue.set($vm.group, 'color', '#' + hex)
                    }
                });
            });
        },
        methods: $.extend({}, baseMethods, {
            groupClass: function (group) {
                return [group._id === this.selectedGroup ? 'active' : '']
            },
            countItems: function (group) {
                var items = this.todoItems;
                if (-1 === group) {
                    return items.length;
                }

                var count = 0, i, n = items.length, groups = Todo.listPluck(this.todoGroups, '_id');

                for (i = 0; i < n; i++) {
                    if ((group && items[i].group == group) || ('' === group && (!items[i].group || $.inArray(items[i].group, groups) === -1))) {
                        count++;
                    }
                }

                return count;
            },
            _select: function (e, id) {
                e.preventDefault();
                this.$emit('select-group', id);
            },
            _add: function (e) {
                this.group = {user: this.adminUser._id};
            },
            _save: function (e) {

                if (!this.group.name) {
                    this.errorMsg = 'Please enter group name.';
                    return;
                }

                this.errorMsg = '';

                var $vm = this,
                    id = this.group._id || 0,
                    at = this.todoGroups.findIndex(function (a) {
                        return a._id === id;
                    });

                // Is editing...
                if (id && at !== -1) {
                    Todo.doAjax('update-todo-group/' + id, {
                        group: this.group
                    }, 'post').then(function (r) {
                        if (r === 'success') {
                            window.Todo.dataStore.commit('updateGroup', $vm.group);
                            $vm.group = false;
                        }
                    });
                } else { // ...or adding new?
                    Todo.doAjax('add-todo-group', {
                        group: this.group
                    }, 'post').then(function (r) {
                        if (r.error) {
                            $vm.message = [r.error, 'error'];
                        } else {
                            window.Todo.dataStore.commit('addGroup', {group: r});
                            $vm.$emit('select-group', r._id);
                            $vm.group = false;
                        }
                    });
                }
            },
            _cancel: function (e) {
                this.group = false;
            },
            _edit: function (e, group) {
                e.preventDefault();
                e.stopPropagation();

                this.group = JSON.parse(JSON.stringify(group));
            },
            _remove: function (e, group) {
                e.preventDefault();
                e.stopPropagation();

                if (!confirm('Remove this group?')) {
                    return;
                }

                let removeItems = false,
                    $vm = this;

                if (this.countItems(group).length && !confirm('Assigns items under this group to \'No group\'?' + "\nOk = Yes, Cancel = No")) {
                    removeItems = true;
                }

                Todo.doAjax('remove-todo-group/' + group, {
                    removeItems: removeItems
                }, 'get').then(function (r) {
                    window.Todo.dataStore.commit('removeGroup', {group: r.group, removeItems: removeItems});

                    if (group === this.selectedGroup) {
                        $vm.$emit('select-group', -1);
                    }
                });
            },
            todoStore: function (a, b) {
                return this.$root.todoStore(a, b);
            }
        })
    });

    Vue.component('todo-items', {
        props: ['todoData', 'selectedGroup', 'adminUser'],
        data: function () {
            return {
                items: [],
                item: false,
                errorMsg: ''
            }
        },
        watch: {
            item: function (item, oldItem) {
                if (item !== false && oldItem === false) {
                    setTimeout(function ($vm) {
                        $vm.$('.todo__item-name').focus();
                    }, 10, this);
                }
            }
        },
        computed: {
            todoGroups: function () {
                return this.todoData.groups || [];
            },
            todoItems: function () {
                return this.todoData.items || [];
            }
        },
        mounted: function () {
            var $vm = this;
            this.$('.item-expired-date').datetimepicker({
                formatDate: 'Y/m/d H:i:s',
                onChangeDateTime: function (dp, $input) {
                    Vue.set($vm.item, 'expiredDate', $input.val())
                }
            });
        },
        methods: {
            getActiveGroupItems: function () {
                return this.getItems(this.selectedGroup);
            },
            getItems: function (group) {
                var allItems = this.todoItems,
                    items = [],
                    groups = Todo.listPluck(this.todoGroups, '_id'),
                    i;

                if (-1 === group) {
                    items = allItems;
                } else {
                    for (i = 0; i < allItems.length; i++) {
                        if ((group && allItems[i].group == group) || ('' === group && (!allItems[i].group || $.inArray(allItems[i].group, groups) === -1))) {
                            items.push(allItems[i]);
                        }
                    }
                }
                this._items = items;
                return items;
            },
            getCachedItems: function () {
                return this._items;
            },
            getGroupName: function (groupId) {
                var group = this.todoGroups.find(function (a, b) {
                    return a._id === groupId;
                });

                return group ? group.name : 'No group'
            },
            getGroupColor: function (groupId) {
                var groups = this.todoGroups,
                    at = groups.findIndex(function (a) {
                        return a._id === groupId;
                    });

                return at !== -1 ? groups[at].color : '';
            },
            getItemDate: function (date) {
                if (date) {
                    return moment(new Date(date)).format("YYYY-MM-DD HH:MM:SS")
                }

                return '';
            },
            getGroupSelected: function () {
                var $vm = this;
                if (this.selectedGroup === -1) {
                    return;
                }

                return this.todoGroups.find(function (a) {
                    return a._id === $vm.selectedGroup;
                })
            },
            $: function (selector) {
                return selector ? $(this.$el).find(selector) : $(this.$el);
            },
            _updateItemStatus: function (item) {
                Todo.doAjax('update-todo-item-status/' + item._id, {
                    status: item.status
                }, 'post').then(function (r) {

                });
            },
            _add: function (e) {
                e.preventDefault();
                this.item = {group: this.selectedGroup, user: this.adminUser._id};
            },
            _save: function (e) {

                if (!this.item.name) {
                    this.errorMsg = 'Please enter item name.';
                    return;
                }

                this.errorMsg = '';

                var $vm = this,
                    id = this.item._id || 0,
                    at = this.todoItems.findIndex(function (a) {
                        return a._id === id;
                    });

                // Is editing...
                if (id && at !== -1) {
                    Todo.doAjax('update-todo-item/' + id, {
                        item: this.item
                    }, 'post').then(function (r) {
                        if (r === 'success') {
                            window.Todo.dataStore.commit('updateItem', $vm.item);
                            $vm.item = false;
                        }
                    });
                } else { // ...or adding new?
                    Todo.doAjax('add-todo-item', {
                        item: this.item
                    }, 'post').then(function (r) {
                        window.Todo.dataStore.commit('addItem', {item: r});
                        $vm.$emit('select-group', r.group);
                        $vm.item = false;
                    });
                }
            },
            _edit: function (e, item) {
                e.preventDefault();
                e.stopPropagation();

                this.item = JSON.parse(JSON.stringify(item));
            },
            _cancel: function (e) {
                this.item = false;
            },
            _remove: function (e, itemId) {
                e.preventDefault();
                e.stopPropagation();

                if (!confirm('Remove this item?')) {
                    return;
                }

                Todo.doAjax('remove-todo-item/' + itemId, {}, 'get').then(function (r) {
                    window.Todo.dataStore.commit('removeItem', {item: r.item});
                });
            }
        }
    });

    Vue.component('todo-group-users', {
        props: ['group'],
        methods: $.extend({}, baseMethods, {
            getAssignees: function () {
                return this.group ? this.group.assignees || [] : [];
            }
        })
    });

})(jQuery);