var express = require('express');
var questions = require('./controllers/questions');

var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);
var _ = require('underscore')._;

const crypto = require('crypto');
var algorithm = 'aes-256-ctr';

users = [];
connections = [];

var adminmode = null;

var clients = {};
var currentsocket = null;
var adminsocket = null;
var alivesockets = [];

server.listen(process.env.PORT || 3000);

console.log('server running');

app.get('/', function (req, res) {
    adminmode = false;
    if (req.query.username && req.query.username.toUpperCase() === 'ADMIN') {
        var currentsockets = _.filter(alivesockets, function (x) {
            return x.hash === req.query.hash;
        });
        if (currentsockets.length > 0) {
            currentsocket = currentsockets[0];
            adminmode = true;
        }
        res.sendfile(__dirname + '/public/index.html');
    } else {
        res.sendFile(__dirname + '/public/index.html');
    }

});


app.use(express.static('./public'));

function genRandomString(username) {
    var _username = username + "yarair";
    var cipher = crypto.createCipher(algorithm, _username)
    var crypted = cipher.update(_username, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}



io.sockets.on('connection', function (socket) {

    connections.push(socket);
    console.log('connected : %s sockets connected', connections.length);

    if (adminmode) {
        socket.emit('adminlogin', { currentsockedid: currentsocket.id });
        socket.emit('appendView', { message: currentsocket.aliveQuestion, name: currentsocket.username });
        socket.username = 'Admin';
    }

    socket.on('disconnect', function (currentsocket) {
        connections.splice(connections.indexOf(currentsocket), 1);
        console.log('connected : %s sockets connected', connections.length);
        users = [];
    });


    socket.on('HumanMessage', function (data) {
        console.log(data.message);



        if (data.initialemit && !adminmode) {
            var returntext = data.message;
            socket.num = data.message;
            socket.emit('appendView', { message: returntext, name: socket.username });
            var text = 'Thanks for providing your number. Please shoot your queries.';
            socket.emit('appendView', { message: text, name: 'Bot' });
        } else {

            if (adminmode) {
                if (socket.username.toUpperCase() === 'ADMIN') {
                    adminsocket = socket;
                    var returntext = data.message;
                    if (data.currentsockedid) {
                        var _currentsockets = _.filter(alivesockets, function (x) {
                            return x.id === data.currentsockedid;
                        });
                        if (_currentsockets.length > 0) {
                            _currentsocket = _currentsockets[0];
                            if (_currentsocket) {
                                _currentsocket.emit('appendView', { message: returntext, name: socket.username });
                                adminsocket.emit('appendView', { message: returntext, name: socket.username });
                                alivesockets.splice(alivesockets.indexOf(_currentsocket), 1);
                            }
                            questions.createQuestions(_currentsocket.aliveQuestion, data.message.trim());
                        }

                    }

                } else {
                    var returntext = data.message;
                    if (currentsocket) {
                        currentsocket.emit('appendView', { message: returntext, name: socket.username });
                        adminsocket.emit('appendView', { message: returntext, name: socket.username });
                    }
                    currentsocket.aliveQuestion = data.message.trim();
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
                        var hash = genRandomString(socket.username + socket.num);
                        socket.hash = hash;
                        socket.aliveQuestion = data.message.trim();
                        alivesockets.push(socket);
                        questions.sendAdminMail(null, 'admin', hash);
                        socket.emit('appendView', { message: text, name: 'Bot', adminmode: true });
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
            adminmode = false;
            var text = 'Hi ' + socket.username + ' !!! Thanks for contacting Airway!!! Please enter your number';
            socket.emit('appendView', { message: text, name: 'Bot' });
            callback(true);
        }
    });
});

