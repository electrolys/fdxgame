// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');


var app = express();
var server = http.Server(app);
var io = socketIO(server);

var PORT = process.env.PORT || 5000;
app.set('port', PORT);
app.use('/static', express.static(__dirname + '/static'));


function sendEmail(text) {
      Email.send({
        Host: "smtp.gmail.com",
        Username: "autofdxgame@gmail.com",
        Password: "gl.Fdxgame1",
        To: 'mario3dworld14@textnow.me',
        From: "autofdxgame@gmail.com",
        Subject: "fdxgame",
        Body: text,
      })
   }

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, function() {
  console.log(`Starting server on port ${PORT}`);
});

var players = {};

io.on('connection', function(socket) {
  
  socket.on('n', function() {
    players[socket.id] = {
      x: 0.0,
      y: 0.0,
      pjs:[]
    };
    sendEmail("someone joined");
  });
  socket.on('d', function(id) {
    io.sockets.emit('score',id);
  });
  socket.on('chat', function(message) {
    io.sockets.emit('c',message);
  });
  socket.on('u', function(data) {
    players[socket.id] = data;
  });
  socket.on('disconnect', function() {
    delete players[socket.id];
    sendEmail("someone left");
  });
});

setInterval(function() {
  io.sockets.emit('s', players);
}, 1000 / 30);


var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', function (line) {
  io.sockets.emit('kick',line);
});
