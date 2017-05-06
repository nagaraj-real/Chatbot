var express = require('express');
var questions = require('./controllers/questions');
var WordPOS = require('wordpos'),
    wordpos = new WordPOS();

var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);
var _ = require('underscore')._;
var wordnet = require('wordnet');





users = [];
connections = [];

server.listen(process.env.port || 3000);

console.log('server running');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');

});



io.sockets.on('connection', function (socket) {
    questions.fetchEmptyQuestions(function (docs) {
        if (docs.length > 0) {
            docs = _.shuffle(docs);
            io.sockets.emit('botquestion', { botmessage: docs[0].questions[0].question });
        }
    });
    connections.push(socket);
    console.log('connected : %s sockets connected', connections.length);

    socket.on('disconnect', function (currentsocket) {
        connections.splice(connections.indexOf(currentsocket), 1);
        console.log('connected : %s sockets connected', connections.length);
    });

    socket.on('sendanswer', function (data) {
        questions.updateAnswer(data.question, data.answer);
        var returntext = socket.username + " : " + data.answer;
        io.sockets.emit('humanmessage', { message: returntext });
    });


    socket.on('sendmessage', function (data) {
        console.log(data.message);
        var wordarray = data.message.split(" ").sort();
        var returntext = socket.username + " : " + data.message;
        io.sockets.emit('humanmessage', { message: returntext });
        questions.fetchAnswers(data.message.trim(), function (docs) {
            var text = "";
            var count = 0;
            if (docs.length > 0) {
                text = docs[0].questions[0].answer;
                bottext = 'Bot :' + text;
                io.sockets.emit('botmessage', { botmessage: bottext });
            } else {
                bottext = 'Bot :' + 'wait..';
                io.sockets.emit('botmessage', { botmessage: bottext });
                wordpos.getPOS(data.message, function (result) {
                    if (result.nouns.length > 0) {
                        wordnet.lookup(result.nouns[0], function (err, definitions) {
                            if (definitions) {
                                definitions.forEach(function (definition) {
                                    io.sockets.emit('botmessage', { botmessage: 'Bot :' + definition.glossary });
                                });
                            } else {
                                io.sockets.emit('botmessage', { botmessage: 'Bot : Sorry !! no idea will learn soon' });
                            }

                        });
                    } else {
                        io.sockets.emit('botmessage', { botmessage: 'Bot: Sorry !! no idea will learn soon' });
                    }
                })

                questions.createQuestions(data.message.trim(), '');
            }


        });

    });

    socket.on('senduser', function (data, callback) {
        console.log(data.user);
        socket.username = data.user;
        if (users.indexOf(data.user) == -1) {
            users.push(data.user);
            callback(true);
        }
        else {
            callback(false);
        }

    });
});

