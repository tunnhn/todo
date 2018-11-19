const express = require('express');
const bodyParser = require('body-parser');
const Config = require('./modules/config')(__dirname + '/todo-config.ini');

const todoRoute = require('./routes/todo');
const userRoute = require('./routes/user');
const extend = require('extend');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const route = express.Router();
const viewPath = __dirname + '/views';

const port = 3456;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.io = io;

global.tokenKey = 'todo';

const checkPermission = require('./modules/check-permission');

app.use(function (req, res, next) {
    let changed = false;
    if (port !== Config.get('port', 'SERVER')) {
        Config.set('port', port, 'SERVER');
        changed = true;
    }

    if (!Config.get('url', 'SERVER')) {
        Config.set('url', req.protocol + '://' + req.get('host'), 'SERVER');
        changed = true;
    }

    if (changed) {
        Config.reload();
    }
    next();
});

global.viewPath = viewPath;
require('./modules/io.authentication')(io);

let Installer = require('./modules/installer');
let installer = new Installer(viewPath);

app.use(function (req, res, next) {
    Config.reload();

    req.getRequest = app.getRequest = function (name) {
        let data = extend(req.params, req.query, req.body);
        return name === undefined ? data : data[name];
    }

    // Set global variables
    global.token = app.getRequest('token');

    next();
});
setInterval(function () {
    io.emit('heartbeat', Date.now());
}, 3000);
app.get('/', function (req, res, next) {
    if (!Config.get()) {
        res.sendFile(global.viewPath + '/installer.html');
    } else {
        res.sendFile(viewPath + '/index.html');
    }
})
app.use(installer.router);
app.use(route);

// Routes
todoRoute(app);
userRoute(app);

/**
 * Listen.
 */
server.listen(port, () => {
    console.log('Listening on port ' + port + '...')
})