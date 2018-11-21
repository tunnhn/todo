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
    methods: $.extend({}, Todo.baseMethods, {
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