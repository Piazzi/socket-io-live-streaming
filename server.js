const express = require("express");
const app = express();
const server = require("http").Server(app);

// setup the view
app.set('view engine', 'ejs');

// setup the public folder 
app.use(express.static('public'));

//UUID is a javascript library that allows us to create unique Ids
const { v4: uuidv4 } = require('uuid');

const io = require('socket.io')(server);

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
debug: true,
});

// import peer js and public folders
app.use('/peerjs', peerServer);
app.use(express.static('public'));

// get route
app.get('/', (req, res) => {
    // redirect the user to a unique room.
    res.redirect(`/${uuidv4()}`);
});


app.get('/:room', (req, res) => {
    // renders the ejs file (view)
    //(Embedded JavaScript). EJS is a templating language.
    res.render('room', { roomId: req.param.room });
});

// listen to a join room event
io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    });
});

server.listen(3030);
