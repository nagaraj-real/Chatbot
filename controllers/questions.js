'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Questions = require('./../models/questions.model');
var fuzzy = require('fuzzy');


var _ = require('underscore')._;


var db = mongoose.connect('mongodb://127.0.0.1:27017', null, function (err) {
    // Log Error
    if (err) {
        console.error('Could not connect to MongoDB!');
        console.log(err);
    } else {
        console.log("mongoose connected")
    }
});


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
            var questionsArray = questionAnswerArray.map(function (a) {
                return a._doc.question;
            });
            //var questionsArray = _.pluck(questionAnswerArray, 'questions');
            var question = fuzzy.filter(_question, questionsArray)
            if (question.length > 0)
                matchQuestions(question[0].original, callback);
            else
                calback(null);
        }
    });
}


exports.createQuestions = createQuestions;

exports.fetchAnswers = fetchAnswers;



