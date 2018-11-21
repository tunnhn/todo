Vue.component('todo-group-users', {
    props: ['group'],
    methods: $.extend({}, Todo.baseMethods, {
        getAssignees: function () {
            return this.group ? this.group.assignees || [] : [];
        }
    })
});