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
    methods: $.extend({}, Todo.baseMethods, {
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

            Todo.setUrl('/t/' + id);
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