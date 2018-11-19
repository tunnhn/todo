let nodemailer = require('nodemailer');
let extend = require('extend');
let Config = require('../modules/config')().getSection('MAILER');
let defaultOptions = {
    from: Config.email
};
let transporter = nodemailer.createTransport({
    service: Config.service,
    auth: {
        user: Config.email,
        pass: Config.password
    }
});
let Mailer = function (mailOptions) {
    this.mailOptions = extend({}, defaultOptions, mailOptions);
    this.transporter = transporter;
}

extend(Mailer.prototype, {
    send: function () {
        let mailer = this;
        return new Promise(function (resolve, reject) {
            transporter.sendMail(mailer.mailOptions, function (error, info) {
                if (error) {
                    reject(error);
                } else {
                    resolve(info)
                }
            });
        })
    }
});

exports = module.exports = function (mailOptions) {
    return new Mailer(mailOptions);
}
