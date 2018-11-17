;jQuery(function ($) {

    new Vue({
        el: '#todo-installer',
        data: function () {
            return {
                message: false,
                config: {
                    mongodb: 'mongodb://admin:admin1234@ds241493.mlab.com:41493/nodejs',
                    adminUser: 'admin',
                    adminPassword: 'admin',
                    adminEmail: 'tunnhn@gmail.com',
                    collectionPrefix: 'todox_'
                },
                errors: {}
            }
        },
        methods: {
            validate: function () {
                if (!this.config.mongodb) {
                    this.message = {content: 'Please enter a valid mongodb url', type: 'error'};
                    this.$('[name="mongodb"]').focus();
                    return false;
                }

                if (!this.config.collectionPrefix) {
                    this.message = {content: 'Please enter mongodb collection prefix', type: 'error'};
                    this.$('[name="collection-prefix"]').focus();
                    return false;
                }

                if (!this.config.adminUser) {
                    this.message = {content: 'Please enter your admin user', type: 'error'};
                    this.$('[name="admin-user"]').focus();
                    return false;
                }

                if (!this.config.adminPassword) {
                    this.message = {content: 'Please enter your admin password', type: 'error'};
                    this.$('[name="admin-password"]').focus();
                    return false;
                }

                if (!this.config.adminEmail) {
                    this.message = {content: 'Please enter your admin email', type: 'error'};
                    this.$('[name="admin-email"]').focus();
                    return false;
                }

                this.message = '';
                return true;
            },
            $: function (selector) {
                return selector ? $(this.$el).find(selector) : $(this.$el);
            },
            getMessage: function () {
                if (!this.message) {
                    return false;
                }

                if (typeof this.message === 'string') {
                    return this.message;
                }

                return this.message.content;
            },
            getMessageClass: function () {
                if (!this.message) {
                    return '';
                }

                if (typeof this.message === 'string') {
                    return this.message.type || 'success';
                }

                return 'success';
            },
            _install: function () {
                var $vm = this;
                if (!this.validate()) {
                    return false;
                }

                Todo.doAjax('install', {config: this.config}, 'post').then(function (r) {
                    if (r.message) {
                        $vm.message = {content: r.message, type: 'success'};
                        setTimeout(function () {
                            window.location.href = window.location.href;
                        }, 3000)
                    } else if (r.errorMsg) {
                        $vm.message = {content: r.errorMsg, type: 'error'};
                    }

                }, function (r) {
                    if (r.errorMsg) {
                        $vm.message = {content: r.errorMsg, type: 'error'};
                    }
                })
            }
        }
    })

});