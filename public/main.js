
var socket;
var initialemit = true;
var adminmode = false;


function onloadbody() {

    socket = io.connect({ 'force new connection': true });

    socket.on('adminlogin', function () {
        adminmode = true;
        document.getElementById('userform').setAttribute("hidden", "");
        document.getElementById('messageform').removeAttribute("hidden");
        document.getElementById('phonenum').classList.add("hide");
        document.getElementById('chatmessage').classList.remove("hide");

    });

    socket.on('appendView', function (data) {
        console.log(data);
        var messages = document.getElementById('messages');
        var p = document.createElement('p');
        var span = document.createElement('span');
        var node = document.createTextNode(data.name + ' : ');
        span.appendChild(node);
        span.classList.add('namespan');
        p.appendChild(span);
        var span = document.createElement('span');
        var node = document.createTextNode(data.message);
        span.classList.add('chatspan');
        span.appendChild(node);
        p.appendChild(span);
        if (data.name.trim().toUpperCase() === 'BOT' || data.name.trim().toUpperCase() === 'ADMIN') {
            p.classList.add('botchat');
            if (data.name.trim().toUpperCase() === 'BOT' && data.adminmode) {
                document.getElementById('chatmessage').setAttribute("disabled", "");
            } else if (data.name.trim().toUpperCase() === 'ADMIN') {
                if(document.getElementById('chatmessage').hasAttribute("disabled"))
                document.getElementById('chatmessage').removeAttribute("disabled");
            }
        } else {
            p.classList.add('humanchat')
        }
        messages.appendChild(p);

    });
}

function sendmessage() {
    if (initialemit && !adminmode) {
        var messagetext = document.getElementById('phonenum');
        document.getElementById('phonenum').classList.add("hide");
        document.getElementById('chatmessage').classList.remove("hide");
        initialemit = false;
        var data = messagetext.value;
        console.log(data);
        socket.emit('HumanMessage', { message: data, initialemit: true });
        messagetext.value = '';
        return false;
    } else {
        var messagetext = document.getElementById('chatmessage');
        var data = messagetext.value;
        console.log(data);
        socket.emit('HumanMessage', { message: data });
        messagetext.value = '';
        return false;
    }



}


function senduser() {
    var usertext = document.getElementById('username');
    console.log(usertext.value);
    socket.emit('senduser', { user: usertext.value }, function (success) {
        if (success) {
            usertext.value = '';
            document.getElementById('userform').setAttribute("hidden", "");
            document.getElementById('messageform').removeAttribute("hidden");
        }
        return false;
    });
}
