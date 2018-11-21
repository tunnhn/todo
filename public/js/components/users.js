Vue.component('todo-users', {
    props: ['todoData'],

    methods: {
        getUserNiceName: function (user) {
            return user.firstName + ' ' + user.lastName;
        },
        getUserAvatar: function (u) {
            var s = [];
            if (u.firstName) {
                s.push(u.firstName.charAt(0))
            }

            if (u.lastName) {
                s.push(u.lastName.charAt(0))
            }

            if (s.length) {
                return s.join('').toUpperCase();
            }

            return Todo.getUserAvatar(u.username)
        },
        _remove: function (e, userId) {
            e.preventDefault();
            e.stopPropagation();

            if (!confirm('Remove this user?')) {
                return;
            }

            Todo.doAjax('remove-user/' + userId, {}, 'get').then(function (r) {
                window.Todo.dataStore.commit('removeUser', {user: r.user});
            });
        }
    }
});