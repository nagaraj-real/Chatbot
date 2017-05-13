var express = require('express');
var questions = require('./controllers/questions');

var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);
var _ = require('underscore')._;

users = [];
connections = [];

var adminmode = null;
var aliveQuestion = null;
var aliveuser = null;
var clients = {};

server.listen(process.env.port || 3000);

console.log('server running');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');

});



io.sockets.on('connection', function (socket) {

    connections.push(socket);
    console.log('connected : %s sockets connected', connections.length);




    socket.on('disconnect', function (currentsocket) {
        connections.splice(connections.indexOf(currentsocket), 1);
        console.log('connected : %s sockets connected', connections.length);
    });


    socket.on('HumanMessage', function (data) {
        console.log(data.message);



        if (data.initialemit) {
            var returntext = data.message;
            socket.emit('appendView', { message: returntext, name: socket.username });
            var text = 'Thanks for providing your number. Please shoot your queries.';
            socket.emit('appendView', { message: text, name: 'Bot' });
        } else {

            if (adminmode) {
                if (socket.username.toUpperCase() === 'ADMIN') {
                    var returntext = data.message;
                    io.sockets.emit('appendView', { message: returntext, name: socket.username });
                    questions.createQuestions(aliveQuestion, data.message.trim());
                } else {
                    var returntext = data.message;
                    socket.emit('appendView', { message: returntext, name: socket.username });
                    aliveQuestion = data.message.trim();
                }
            } else {
                var returntext = data.message;
                socket.emit('appendView', { message: returntext, name: socket.username });

                questions.fetchAnswers(data.message.trim(), function (doc) {
                    var text = "";
                    if (doc) {
                        var text = doc.questions[0].answer;
                        socket.emit('appendView', { message: text, name: 'Bot' });
                    } else {
                        var text = 'Oh ho looks like I have lot to learn!!  Please wait for the admin to give you solution.';
                        socket.emit('appendView', { message: text, name: 'Bot' });
                        aliveQuestion = data.message.trim();
                        aliveuser = socket.username;
                    }


                });
            }
        }



    });

    socket.on('senduser', function (data, callback) {
        console.log(data.user);
        socket.username = data.user;

        if (true || users.indexOf(data.user) == -1) {
            users.push(data.user);

            if (socket.username.toUpperCase() === 'ADMIN') {
                adminmode = true;
                socket.emit('appendView', { message: aliveQuestion, name: aliveuser });
            } else {
                if(users.length>1){
                    socket.disconnect();
                }
                adminmode = false;
                var text = 'Hi ' + socket.username + ' !!! Thanks for contacting Airway!!! Please enter your number';
                socket.emit('appendView', { message: text, name: 'Bot' });
            }
            callback(true);
        }
    });
});

