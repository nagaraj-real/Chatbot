'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Questions = require('./../models/questions.model');


var _ = require('underscore')._;


var db = mongoose.connect('mongodb://127.0.0.1:27017', null, function (err) {
    // Log Error
    if (err) {
        console.error(chalk.red('Could not connect to MongoDB!'));
        console.log(err);
    } else {
        console.log("mongoose connected")
    }
});


var createQuestions = function (_question, answer, counter, callback) {

    var questions = [];
    var nonquestions = [];

    var question = {
        question: _question,
        answer: answer,
        counter: counter,
        words: '',
        nonquestion: null
    };

    var wordarray = _question.split(" ").sort();

    question.words = wordarray.toString();

    if (_.contains(wordarray, 'what') ||
        _.contains(wordarray, 'how') ||
        _.contains(wordarray, 'why') ||
        _.contains(wordarray, 'when') ||
        _.contains(wordarray, '?') ||
        _.contains(wordarray, 'where') ||
        _.contains(wordarray, 'which') ||
        _.contains(wordarray, 'who')) {
        question.nonquestion = false;

    } else {
        question.nonquestion = true;
    }

    questions.push(question);

    console.log(questions);
    var question = new Questions({ questions: questions });
    question.save(callback);


};

var updateAnswer = function (question, answer) {
    Questions.findOne({ 'questions': { $elemMatch: { question: { $eq: question } } } }, function (err, doc) {
        if (err){}
        else{
            doc.questions[0].answer=answer;
            doc.save();
        }
    });
}


var fetchAnswers = function (question, callback) {
    Questions.find({ 'questions': { $elemMatch: { question: { $eq: question}, answer: { $ne: '' } } } }, function (err, docs) {
        if (err)
            callback(err);
        else {
            callback(docs);
        }
    });

};

var fetchEmptyQuestions = function (callback) {
    Questions.find({ 'questions': { $elemMatch: { answer: { $eq: '' } } } }, function (err, docs) {
        if (err)
            callback(err);
        else {
            callback(docs);
        }
    });

};



exports.createQuestions = createQuestions;

exports.fetchAnswers = fetchAnswers;

exports.fetchEmptyQuestions = fetchEmptyQuestions;

exports.updateAnswer=updateAnswer;



