;(function ($) {
    Vue.component('todo-item-users', {
        props: ['item'],
        data: function () {
            return {
                message: '',
                username: ''
            }
        },
        methods: $.extend({}, Todo.baseMethods, {
            getAssignees: function () {
                return this.group ? this.group.assignees || [] : [];
            },
            getAssigneeName: function (user) {
                if (user.username === this.$root.adminUser.username) {
                    return 'You';
                }

                return user.username
            },
            getUserAvatar: function (u) {
                return Todo.getUserAvatar(u)
            },
            _add: function () {
                var $vm = this;

                if (!this.username) {
                    this.$('[name="add-user"]').focus();
                    $vm.message = 'Please enter username';
                    return;
                }
                $vm.message = '';
                Todo.doAjax('assign-user-to-item/' + this.item._id + '/' + this.username, {}).then(function (r) {
                    if (r.error) {
                        $vm.message = r.error;
                    } else {
                        $vm.message = 'Assigned user to this item';
                        $vm.username = '';
                    }

                    setTimeout(function () {
                        $vm.message = '';
                    }, 3000)
                }, function (r) {
                    console.log('Error:', r);
                })
            },
            _maybeAdd: function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    e.stopPropagation();
                    this._add();
                }
            }
        })
    })
})(jQuery);