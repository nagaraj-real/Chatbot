var express = require('express');
var questions = require('./controllers/questions');
var WordPOS = require('wordpos'),
    wordpos = new WordPOS();

var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);
var _ = require('underscore')._;

var Twitter = require('node-tweet-stream')
    , t = new Twitter({
        consumer_key: 'FJnRODaP39lntry79CSCR9K8M',
        consumer_secret: '3LMY1DGLIzcEYs7Dtf0wzI6BqRdg1xJ5FaRsc3X0Vvj4Az0EIs',
        token: '1608179036-pRHykxCtCEcxiOFMO4dHhHsh60QXcw9EdyWVZXa',
        token_secret: 'YI0tl74Drfox4MWsYKhT6MrFsJbUxieFWGwRxdpkGf8m7'
    })

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
        connections.splice(connections.indexOf(currentsocket), 1);
        console.log('connected : %s sockets connected', connections.length);
    });

    socket.on('sendmessage', function (data) {
        console.log(data.message);
        var wordarray = data.message.split(" ").sort();
        var returntext = socket.username + " : " + data.message;
        io.sockets.emit('humanmessage', { message: returntext });
        questions.fetchAnswers(wordarray, function (docs) {
            var text = "";
            var count=0;
            if (docs.length > 0) {
                text = docs[0].questions[0].answer;
                bottext = 'bot :' + text;
                io.sockets.emit('botmessage', { botmessage: bottext });
            } else {
                bottext = 'bot :' + 'I will learn more about this';
                io.sockets.emit('botmessage', { botmessage: bottext });
                t.track('#'+data.message);
                t.on('tweet', function (tweet) {
                    console.log(tweet);
                    count++;
                    bottext = 'bot :' + tweet.text;
                     io.sockets.emit('botmessage', { botmessage: bottext });
                    if(count>2){
                        t.untrack('#'+data.message)
                    }
                });
                
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

