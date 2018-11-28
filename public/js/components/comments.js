Vue.component('todo-comments', {
    props: ['item'],
    data: function () {
        return {
            newComment: {
                username: '',
                content: ''
            },
            comments: []
        }
    },
    watch: {
        'item._id': function (newId) {
            //if(!newId){
            this.comments = [];
            //}
            newId && this.loadComments(newId);
        }
    },
    computed: {
        // comments: {
        //     get: function () {
        //         return this.item ? (this.item.comments || []) : [];
        //     }, set: function (comments) {
        //         this.comments = comments;
        //     }
        // }
        adminUser: function () {
            return this.$root.adminUser
        }
    },
    mounted: function () {
        var $vm = this;
        this.newComment.username = this.$root.adminUser.username;

        this.$root.socket.on('comment-added', function (data) {
            if (data.item === $vm.item._id) {
                $vm.comments.push(data);
            }
        })
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
        getComments: function () {
            return this.item ? this.item.comments || [] : [];
        },
        getUserAvatar: function (u) {
            return Todo.getUserAvatar(u)
        },
        loadComments: function (itemId) {
            var $vm = this;
            Todo.doAjax('load-item-comments/' + itemId).then(function (comments) {
                $vm.comments = comments;
            })
        },
        isCurrentUser: function (user) {
            return user._id == this.adminUser._id;
        },
        _delete: function ($event, id) {
            $event.preventDefault();

            var $vm = this;
            Todo.doAjax('delete-item-comment/' + id, {}, 'post').then(function (comment) {
                var at = $vm.comments.findIndex(function (c) {
                    return c._id == id;
                });

                if (at > -1) {
                    $vm.comments.splice(at, 1);
                }
            })
        },
        _addComment: function () {
            var $vm = this;

            Todo.doAjax('add-item-comment/' + this.item._id, {
                comment: this.newComment
            }, 'post').then(function (r) {
                //$vm.comments.push(r)
            })

            this.newComment.content = '';
        },

        _add: function () {
            var username = this.$('[name="add-user"]').val();

            Todo.doAjax('assign-user-to-item/' + this.item._id + '/' + username, {}).then(function (r) {
                console.log(r)
            }, function (r) {
                console.log('Error:', r);
            })
        },

        _maybeAddComment: function (e) {
            if ((e.metaKey || e.ctrlKey) && e.keyCode === 13) {
                this._addComment();
            }
        }
    })
})
