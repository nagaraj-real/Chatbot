var nodemailer = require('nodemailer');

var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: "zanmilearning@gmail.com",
        pass: "zanmi@123"
    }
};


var smtpTransport = nodemailer.createTransport(smtpConfig);


var sendmail = function (mailOptions, template, context, callback) {
    var send = smtpTransport.templateSender(template);
    send(mailOptions, context, callback);
}


module.exports = {
    sendmail: sendmail
}