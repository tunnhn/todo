Vue.component('todo-mainmenu', {
    props: ['todoData', 'currentPage', 'menuItems'],
    data: function () {
        return {
            cachedMenuItems: false,
        }
    },
    computed: {
        groups: function () {
            return this.todoData.groups || [];
        },
        items: function () {
            return this.todoData.items || [];
        },
        // menuItems: function () {
        //     return this.todoData.menuItems || [];
        // },
        currentMenu: {
            get: function () {
                return this.currentPage;
            }, set: function (v) {
                //this.currentPage = v;
            }
        }
    },
    methods: {
        getMenuItems: function (parent, _return) {
            var allItems = this.menuItems,
                n = allItems.length,
                items = [],
                i;

            for (i = 0; i < n; i++) {
                if ((parent && parent == allItems[i].parent) || (!parent && !allItems[i].parent)) {
                    items.push(allItems[i])
                }
            }

            this.cachedMenuItems = items;
            return items;
        },
        callAction: function (e, action, id, parentId, args) {
            e.preventDefault();

            if (arguments.length === 4) {
                args = parentId;
            }

            this[action] && this[action].call(this, id, parentId, args);
        },
        callToCounter: function (item) {
            var obj = item.counter[0],
                cb = item.counter[1];

            return item.counter ? obj[cb].apply(obj, item.counterArgs) : 0;
        },
        getCounterColor: function (item) {

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
        _showPage: function (e, id, childId) {
            e.preventDefault();
            this.$emit('show-menu-item', id, childId);
        }
    }
});