var express = require('express');
var questions = require('./controllers/questions');

var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);
var _ = require('underscore')._;

users = [];
connections = [];

var adminmode = null;
var initialemit = null;
var aliveQuestion = null;
var aliveuser=null;
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

        var returntext = data.message;
        io.sockets.emit('appendView', { message: returntext,name:socket.username });

        if (initialemit) {
            var text = 'Thanks for providing your number. Please shoot your queries.';
            io.sockets.emit('appendView', { message: text,name:'Bot' });
            initialemit = false;
        } else {

            if (adminmode) {
                if (socket.username.toUpperCase() === 'ADMIN') {
                    questions.createQuestions(aliveQuestion, data.message.trim());
                } else {
                    aliveQuestion = data.message.trim();
                }
            } else {

                questions.fetchAnswers(data.message.trim(), function (doc) {
                    var text = "";
                    if (doc) {
                        var text = doc.questions[0].answer;
                        io.sockets.emit('appendView', { message: text,name:'Bot' });
                    } else {
                        var text = 'Oh ho looks like I have lot to learn!!  Please wait for the admin to give you solution.';
                        io.sockets.emit('appendView', { message: text,name:'Bot' });
                        aliveQuestion = data.message.trim();
                        aliveuser=socket.username;
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
                initialemit = false;
                connections[connections.length-1].emit('appendView', { message: aliveQuestion,name:aliveuser});
            } else {
                adminmode = false;
                initialemit = true;
                var text = 'Hi ' + socket.username + ' !!! Thanks for contacting Airway!!! Please enter your number';
                io.sockets.emit('appendView', { message: text,name:'Bot' });
            }
            callback(true);
        }
    });
});

