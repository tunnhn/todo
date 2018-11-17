const express = require('express');
const bodyParser = require('body-parser');
const todoRoute = require('./routes/todo');
const extend = require('extend');
const Config = require('./modules/config')(__dirname + '/todo-config.ini');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);


const route = express.Router();
const viewPath = __dirname + '/views';


app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Authentication
global.tokenKey = 'todo';

const checkPermission = require('./modules/check-permission');

app.use(function (req, res, next) {
    console.log('Request:', req.body || req.params || req.query);
    next();
});

global.viewPath = viewPath;
require('./modules/io.authentication')(io);

let Installer = require('./modules/installer');
let installer = new Installer(viewPath);

app.use(function (req, res, next) {
    Config.reload();
    console.log('Config = ', Config);

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
    console.log("=======", Config.get(), "=======")
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

/**
 * Listen.
 */
server.listen(3456, () => {
    console.log('Listening on port 3003...')
})