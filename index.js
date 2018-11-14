const express = require('express');
const bodyParser = require('body-parser');
const todoRoute = require('./routes/todo');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const route = express.Router();
const viewPath = __dirname + '/views';

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Authentication
require('./modules/io.authentication')(io);

app.get('/', function (req, res) {
    res.sendFile(viewPath + '/index.html');
});

///
route.use(function (req, res, next) {
    app.getRequest = function (name) {
        return req.body[name] || req.query[name] || req.params[name];
    }
    next();
});

app.use(route);

// Routes
todoRoute(app);

/**
 * Listen.
 */
server.listen(3456, () => {
    console.log('Listening on port 3003...')
})