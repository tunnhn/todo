Vue.component('todo-items', {
    props: ['todoData', 'adminUser', 'currentChildPage'],
    data: function () {
        return {
            items: [],
            item: false,
            selectedItem: false,
            selectedGroup: 'no-group',
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
        },
        currentChildPage: function (a, b) {
            this.selectedGroup = a ? a : '';
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

            if ('' === group) {
                items = allItems;
            } else {
                for (i = 0; i < allItems.length; i++) {
                    if ((group && allItems[i].group == group) || ('no-group' === group && (!allItems[i].group || $.inArray(allItems[i].group, groups) === -1))) {
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
        haveAssignees: function () {
            return this.selectedItem && this.selectedItem.assignees.length > 0;
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

            if (this.item.assignees) {
                for (var i = this.item.assignees.length - 1; i >= 0; i--) {
                    if ($.isPlainObject(this.item.assignees[i])) {
                        this.item.assignees[i] = this.item.assignees[i]._id;
                    }
                }
            }

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
        _editGroup: function (e) {
            this.$emit('edit-group');
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
        },
        _selectItem: function (e, item) {
            this.selectedItem = item;
            if (item.group) {
                Todo.setUrl('/t/' + item.group + '/' + item._id);
            } else {
                Todo.setUrl('/t/0/' + item._id);
            }
        }
    }
});