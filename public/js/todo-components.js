;(function ($) {

    Vue.component('authentication', {
        props: ['adminUser'],
        data: function () {
            return {
                errorMsg: '',
                loginAuth: {
                    usr: '',
                    pwd: ''
                },
            }
        },
        computed: {},
        mounted: function () {
            var $vm = this;
            this.$root.socket.on('login failed', function (errorMsg) {
                $vm.errorMsg = errorMsg;
            }).on('logged in', function (u) {
                this.emit('update-admin-user', u);
                $.cookie('todo-authorized-token', u.token);
            });
        },
        methods: {
            _login: function () {
                this.$root.socket.emit('login', this.loginAuth);
            }
        }
    });


    Vue.component('todo-groups', {
        props: ['todoData', 'selectedGroup'],
        data: function () {
            return {
                group: false,
                errorMsg: ''
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
        methods: {
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
            $: function (selector) {
                return selector ? $(this.$el).find(selector) : $(this.$el);
            },
            _select: function (e, id) {
                e.preventDefault();
                this.$emit('select-group', id);
            },
            _add: function (e) {
                this.group = {};
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
                        window.Todo.dataStore.commit('addGroup', {group: r});
                        $vm.$emit('select-group', r._id);
                        $vm.group = false;
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

                let removeItems = false;
                if (!confirm('Assigns items under this group to \'No group\'?' + "\nOk = Yes, Cancel = No")) {
                    removeItems = true;
                }

                Todo.doAjax('remove-todo-group/' + group, {
                    removeItems: removeItems
                }, 'get').then(function (r) {
                    window.Todo.dataStore.commit('removeGroup', {group: r.group});
                });
            },
            todoStore: function (a, b) {
                return this.$root.todoStore(a, b);
            }
        }
    });

    Vue.component('todo-items', {
        props: ['todoData', 'selectedGroup'],
        data: function () {
            return {
                items: [],
                item: false,
                errorMsg: ''
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
            this.$('.item-expired-date').datetimepicker();
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
            $: function (selector) {
                return selector ? $(this.$el).find(selector) : $(this.$el);
            },
            _add: function (e) {
                e.preventDefault();
                this.item = {group: this.selectedGroup};
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
    })

})(jQuery);