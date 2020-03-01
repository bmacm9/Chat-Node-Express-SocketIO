var express = require('express')
var app = express()
var http = require('http').createServer(app)
var io = require('socket.io')(http)
var siofu = require('socketio-file-upload')
var users = []
io.on('connection', function (socket) {
  console.log('a user connected')
  socket.emit('inicia sesion', null);
  socket.on('usuario', function (user) {
    users.push(user)
    updateClients();
    socket.on('escribiendo', function (user) {
      socket.broadcast.emit('typing', user)
    });
    socket.on('chat message', function (msg) {
      io.emit('chat message', [user, msg[0]]);
      if (msg[1][0]) {
        io.emit('chat image', msg[1][0])
      }
    });
    socket.on('disconnect', function () {
      for (var i = 0; i < users.length; i++) {
        if (users[i] == user) {
          users.splice(i, 1)
        }
      }
      updateClients();
    });
  });
  var uploader = new siofu()
  uploader.dir = "./public/files"
  uploader.on('complete', function (e) {
    console.log("envia archivo " + e.file.name)
  });
  uploader.listen(socket)
});
function updateClients() {
  io.sockets.emit('update', users);
};
app.use(siofu.router).use(express.static(__dirname + '/public'));

http.listen(3000, function () {
  console.log('listening on *:3000');
});