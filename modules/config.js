const fs = require('fs');
const ini = require('ini');
const extend = require('extend');

let Config = function (configFile) {
    this.configFile = configFile;
    this.config = false;

    if (fs.existsSync(this.configFile)) {
        this.config = ini.parse(fs.readFileSync(this.configFile, 'utf-8'));
    } else {

    }
}

extend(Config.prototype, {
    get: function (name, group) {

        if (name) {
            if (group) {
                return this.config[group] ? this.config[group][name] : undefined;
            }

            return this.config ? this.config[name] : undefined;
        }
        return this.config;
    },
    set: function (name, value, group) {
        if (!this.config[group]) {
            this.config[group] = {};
        }

        this.config[group][name] = value;
        fs.writeFileSync(this.configFile, ini.stringify(this.config));

        return this;
    },
    getSection: function (name) {
        return this.config[name] || {};
    },
    reload: function () {
        if (fs.existsSync(this.configFile)) {
            this.config = ini.parse(fs.readFileSync(this.configFile, 'utf-8'));
        } else {
            this.config = false;
        }

        return this;
    }
});

exports = module.exports = function (configFile) {
    if (global.config === undefined) {
        global.config = new Config(configFile);
    }

    return global.config;
};