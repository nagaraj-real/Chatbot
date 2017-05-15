var nodemailer = require('nodemailer');
process.env.G_USER_NAME = 'zanmilearning@gmail.com';
process.env.G_PASSWORD = 'zanmi@1234';
var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.G_USER_NAME,
        pass: process.env.G_PASSWORD
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