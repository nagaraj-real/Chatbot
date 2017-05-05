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
        nonquestions: false
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
        question.nonquestions = false;

    } else {
        question.nonquestions = true;
    }

    questions.push(question);

    console.log(questions);
    var question = new Questions({ questions: questions });
    question.save(callback);


};


var fetchAnswers = function (words, callback) {
    Questions.find({ 'questions': { $elemMatch: { words: { $regex: words, $options: 'i' } } } }, function (err, docs) {
        if (err)
            callback(err);
        else {
            callback(docs);
        }
    });

};

// fetchAnswers(['tiger', 'what']);

// createQuestions('what is a tiger', 'what is a tiger', 0,function(){
//  createQuestions('who does a tiger eat', 'who does a tiger eat', 0,function(){
//      createQuestions('apple is a fruit', 'who is the prime minister', 0,function(){
//          fetchAnswers('tiger','who')
//      });
//  });
// });





exports.createQuestions = createQuestions;

exports.fetchAnswers = fetchAnswers;



