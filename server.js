var express = require('express');


var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);

users = [];
connections = [];

server.listen(process.env.port || 3000);

console.log('server running');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');

});

io.sockets.on('connection', function (socket) {
    connections.push(socket);
    console.log('connected : %s sockets connected', connections.length);

    socket.on('disconnect', function (currentsocket) {
        connections.splice(connections.indexOf(currentsocket),1);
        console.log('connected : %s sockets connected', connections.length);
    });

     socket.on('sendmessage', function (data) {
         console.log(data.message);
         var returntext=socket.username + " : "+ data.message;
         io.sockets.emit('botmessage',{message:returntext})
    });

     socket.on('senduser', function (data,callback) {
         console.log(data.user);
         socket.username=data.user;
         if(users.indexOf(data.user) == -1){
             users.push(data.user);
             callback(true);
         }
         else{
             callback(false);
         }
         
    });
});

