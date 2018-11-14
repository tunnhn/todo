;(function ($) {

    function createTodoStore(todoData) {

        var getters = {
            all: function (state) {
                return state;
            },
            groups: function (state) {
                return state.groups || [];
            },
            items: function (state) {
                return state.items || [];
            }
        };

        var mutations = {
            addGroup: function (state, data) {
                state.groups.push(data.group)
            },
            removeGroup: function (state, data) {
                if (data.removeItems) {
                    var i;
                    console.log(data);
                    for (i = state.items.length; i > 0; i--) {
                        if (state.items[i - 1].group === data.group) {
                            state.items.splice(i - 1, 1);
                        }
                    }
                }

                var at = state.groups.findIndex(function (a, b) {
                    return a._id === data.group;
                });

                if (at !== -1) {
                    state.groups.splice(at, 1);
                }
            },
            updateGroup: function (state, group) {
                var at = state.groups.findIndex(function (a, b) {
                    return a._id === group._id;
                });

                if (at !== -1) {
                    Vue.set(state.groups, at, group);
                }
            },
            addItem: function (state, data) {
                state.items.push(data.item)
            },

            removeItem: function (state, data) {
                var at = state.items.findIndex(function (a, b) {
                    return a._id === data.item;
                });

                if (at !== -1) {
                    state.items.splice(at, 1);
                }
            },
            updateItem: function (state, item) {
                var at = state.items.findIndex(function (a, b) {
                    return a._id === item._id;
                });

                if (at !== -1) {
                    Vue.set(state.items, at, item);
                }
            },
        };

        var actions = {};

        return new Vuex.Store({
            state: todoData,
            getters: getters,
            mutations: mutations,
            actions: actions
        });
    }

    if (window.Todo === undefined) {
        window.Todo = {};
    }

    window.Todo.createTodoStore = createTodoStore;
})(jQuery);