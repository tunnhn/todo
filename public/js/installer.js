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
                    collectionPrefix: 'todox_',
                    MAILER: {
                        service: '',
                        email: '',
                        password: ''
                    }
                },
                errors: {},
                mailers: {
                    '': 'Disable',
                    gmail: 'Gmail'
                },
                step: 'database',
                stepIndex: 0,
                steps: [
                    {
                        id: 'database',
                        validator: 'validateStep'
                    },
                    {
                        id: 'admin-user',
                        validator: 'validateStep'
                    },
                    {
                        id: 'mailer',
                        validator: 'validateStep'
                    }
                ],
                status: ''
            }
        },
        mounted: function () {
            $.cookie('todo-authorized-token', '');
        },
        methods: {
            validateStep: function (step) {
                console.log(step)
                switch (step) {
                    case 'database':
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
                        break;
                    case 'admin-user':
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

                        if (!Todo.validateEmail(this.config.adminEmail)) {
                            this.message = {content: 'Please enter your admin email', type: 'error'};
                            this.$('[name="admin-email"]').focus();
                            return false;
                        }
                        break;
                    case 'mailer':
                        if (this.config.MAILER.service) {
                            if (!Todo.validateEmail(this.config.MAILER.email)) {
                                this.message = {content: 'Please enter mailer email', type: 'error'};
                                this.$('[name="mailer-email"]').focus();
                                return false;
                            }

                            if (!this.config.MAILER.password) {
                                this.message = {content: 'Please enter mailer password', type: 'error'};
                                this.$('[name="mailer-password"]').focus();
                                return false;
                            }
                        }
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

                if (typeof this.message !== 'string') {
                    return this.message.type || 'success';
                }

                return 'success';
            },
            toggleButtons: function () {
                var $vm = this,
                    steps = this.$('.step').map(function () {
                        return $(this).data('step');
                    }).get();

                this.stepIndex = steps.findIndex(function (a) {
                    return a === $vm.step;
                });
            },
            validate: function () {
                var $vm = this,
                    step = this.steps.find(function (a) {
                        return a.id === $vm.step;
                    }),
                    validate;

                if (step.validator) {
                    validate = $vm[step.validator].call($vm, step.id);

                    if (!validate) {
                        return false;
                    }
                }

                return true;
            },
            _nav: function (nav) {

                if (!this.validate()) {
                    return;
                }

                if (nav === 'back') {
                    this._back();
                } else {
                    this._next();
                }
            },
            _back: function () {
                var $prev = this.$('.step:visible').prev(),
                    step = $prev.data('step');

                if (step) {
                    this.step = step;
                }

                this.toggleButtons();
            },
            _next: function () {
                var $next = this.$('.step:visible').next(),
                    step = $next.data('step');

                if (step) {
                    this.step = step;
                }

                this.toggleButtons();
            },
            _install: function () {
                var $vm = this;
                if (!this.validate()) {
                    return;
                }

                this.status = 'installing';
                this.message = 'Todo installing...';

                Todo.doAjax('install', {config: this.config}, 'post').then(function (r) {
                    if (r.message) {
                        $vm.message = {content: r.message, type: 'success'};
                        setTimeout(function () {
                            window.location.href = window.location.href;
                        }, 3000);
                    } else if (r.errorMsg) {
                        $vm.message = {content: r.errorMsg, type: 'error'};
                        $vm.status = '';
                    }
                }, function (r) {
                    if (r.errorMsg) {
                        $vm.message = {content: r.errorMsg, type: 'error'};
                    }
                    $vm.status = '';
                })
            }
        }
    })

});