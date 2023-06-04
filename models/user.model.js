'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var mailutil = require('./../../util/mail');

var common = require('./../../util/common');

var fs = require('fs');
var mailtemplate = fs.readFileSync('./mailtemplate.html');



var sendMail = function (mailid, username, hash) {

    var tomailid;

    if (mailid)
        tomailid = mailid;
    else
        tomailid = 'raj.nagaraj1990@gmail.com';

    var mailOptions = {
        from: '"Zanmi Learn ✉" <zanmilearning@gmail.com>', // sender address
        to: mailid,// list of receivers
    };

    var templateobj = {
        subject: 'Activate your account ✔',
        text: '',
        html: mailtemplate
    };

    var context = {
        extlink: 'http://zanmilearn.herokuapp.com/api/v2/users/validateemail?username=' + username + '&hash=' + hash
    }

    mailutil.sendmail(mailOptions, templateobj, context, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });

}


var userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        required: true,
        trim: true
    },
    location: String,
    active: {
        type: Boolean,
        default: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    hash: {
        type: String
    },
    created_at: String,
    updated_at: String
});

userSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now.toString();
    if (!this.created_at) {
        this.created_at = now.toString();
        this.hash = common.genRandomString(this.username);
        sendMail(this.email, this.username, this.hash);
    }

    next();
});

var usermodel = mongoose.model('User', userSchema);
module.exports = usermodel;
