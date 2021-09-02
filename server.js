const express = require("express");
const app = express();
const server = require("http").Server(app);

//UUID is a javascript library that allows us to create unique Ids
const { v4: uuidv4 } = require("uuid");

// setup the view
app.set("view engine", "ejs");

const io = require('socket.io')(server);

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// import peer js and public folders
app.use("/peerjs", peerServer);

// setup the public folder 
app.use(express.static("public"));

// redirect the user to a unique room.
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

// get route
app.get("/:room", (req, res) => {
    // renders the ejs file (view)
    //(Embedded JavaScript). EJS is a templating language.
  res.render("room", { roomId: req.params.room });
});

// listen to a join room event
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

server.listen(process.env.PORT || 3030, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });