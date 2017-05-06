var express = require('express');
var questions = require('./controllers/questions');
var WordPOS = require('wordpos'),
    wordpos = new WordPOS();

var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);
var _ = require('underscore')._;
var wordnet = require('wordnet');


var Twit = require('twit')

var T = new Twit({
    consumer_key: 'FJnRODaP39lntry79CSCR9K8M',
    consumer_secret: '3LMY1DGLIzcEYs7Dtf0wzI6BqRdg1xJ5FaRsc3X0Vvj4Az0EIs',
    access_token: '1608179036-pRHykxCtCEcxiOFMO4dHhHsh60QXcw9EdyWVZXa',
    access_token_secret: 'YI0tl74Drfox4MWsYKhT6MrFsJbUxieFWGwRxdpkGf8m7',
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests. 
})


users = [];
connections = [];

sendMessageCount = 0;

server.listen(process.env.port || 3000);

console.log('server running');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');

});



io.sockets.on('connection', function (socket) {
    questions.fetchEmptyQuestions(function (docs) {
        if (docs.length > 0) {
            docs = _.shuffle(docs);
            if (docs[0].questions[0].nonquestion) {
                io.sockets.emit('botmessage', { botmessage: 'Bot :' + docs[0].questions[0].question });
            } else {
                io.sockets.emit('botquestion', { botmessage: docs[0].questions[0].question });
            }
        }
    });
    connections.push(socket);
    console.log('connected : %s sockets connected', connections.length);

    socket.on('disconnect', function (currentsocket) {
        connections.splice(connections.indexOf(currentsocket), 1);
        console.log('connected : %s sockets connected', connections.length);
    });

    socket.on('sendanswer', function (data) {
        questions.updateAnswer(data.question.trim(), data.answer);
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

                questions.createQuestions(data.message.trim(), '');
            }


        });

        sendMessageCount++;
        if (sendMessageCount % 2 === 0) {
            questions.fetchEmptyQuestions(function (docs) {
                if (docs.length > 0) {
                    docs = _.shuffle(docs);
                    io.sockets.emit('botquestion', { botmessage: docs[0].questions[0].question });
                }
            });
        }

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

