'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Questions = require('./../models/questions.model');
var fuzzy = require('fuzzy');


var _ = require('underscore')._;

var mailutil = require('./../util/mail');

var fs = require('fs');
var mailtemplate = fs.readFileSync('./mailtemplate.html');

var uri = process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://ds027155.mlab.com:27155/chatbot';
var options = {
    user: 'raj',
    pass: 'raj@123'
};

var db = mongoose.connect(uri, options, function (err) {
    // Log Error
    if (err) {
        console.error('Could not connect to MongoDB!');
        console.log(err);
    } else {
        console.log("mongoose connected")
    }
});


var sendAdminMail = function (mailid, username, hash) {

    var tomailid;

    if (mailid)
        tomailid = mailid;
    else
        tomailid = 'raj.nagaraj1990@gmail.com';

    var mailOptions = {
        from: '"Airway Customer Care ✉" <raj.nagaraj1990@gmail.com>', // sender address
        to: tomailid,// list of receivers
    };

    var templateobj = {
        subject: 'Customer Queries ✔',
        text: '',
        html: mailtemplate
    };

    var context = {
        extlink: 'http://localhost:3000?username=' + username + '&hash=' + hash
    }

    mailutil.sendmail(mailOptions, templateobj, context, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });

}



var createQuestions = function (_question, _answer, callback) {

    var questions = [];

    var question = {
        question: _question,
        answer: _answer
    }

    questions.push(question);

    console.log(questions);

    var question = new Questions({ questions: questions });
    question.save(callback);

};


var matchQuestions = function (question, callback) {
    Questions.findOne({ 'questions': { $elemMatch: { question: { $eq: question }, answer: { $ne: '' } } } }, function (err, doc) {
        if (err)
            callback(err);
        else {
            callback(doc);
        }
    });

};


var fetchAnswers = function (_question, callback) {
    Questions.find({}, function (err, docs) {
        if (err)
            callback(err);
        else {
            var questionAnswerArray = docs[0].questions;
            var questionsArray = [];
            var dummy = docs.map(function (a) {
                return a.questions.map(function (b) {
                    questionsArray.push(b._doc.question);
                    return questionsArray;
                });
            });

            var question = fuzzy.filter(_question, questionsArray)
            if (question.length > 0)
                matchQuestions(question[0].original, callback);
            else
                callback(null);
        }
    });
}


exports.createQuestions = createQuestions;

exports.fetchAnswers = fetchAnswers;

exports.sendAdminMail = sendAdminMail;



