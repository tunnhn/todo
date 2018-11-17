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

        if(name) {
            if (group) {
                return this.config[group] ? this.config[group][name] : undefined;
            }

            return this.config ? this.config[name] : undefined;
        }
        return this.config;
    },
    reload: function () {
        if (fs.existsSync(this.configFile)) {
            this.config = ini.parse(fs.readFileSync(this.configFile, 'utf-8'));
            console.log('Read INI')
        }else{
            console.log('INI not found')
            this.config = false;
        }
    }
});

exports = module.exports = function (configFile) {
    if (global.config === undefined) {
        global.config = new Config(configFile);
    }

    return global.config;
};