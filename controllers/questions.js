'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Questions = require('./../models/questions.model');
var WordPOS = require('wordpos'),
    wordpos = new WordPOS();

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


var createQuestions = function (_question, answer, counter,callback) {
    console.log(_question);
    var questions = [];




    wordpos.getPOS(_question, function (result) {
        var question = {
            question: _question,
            answer: answer,
            counter: counter,
            nouns: ''
        };
        var nouns = _.difference(result.nouns, result.adjectives);
        question.nouns = _question.split(" ");;
        questions.push(question);
        var question = new Questions({ questions: questions });
        question.save(callback);
    });


};


var fetchAnswers = function (noun) {
    Questions.find({ 'questions': { $elemMatch: { nouns: {$in:noun} } } }, function (err, docs) {
        if (err)
            console.log(err);
        else{
            console.log(docs[0].questions);
        }
    });

};

createQuestions('what is a tiger', 'what is a tiger', 0,function(){
 createQuestions('who does a tiger eat', 'who does a tiger eat', 0,function(){
     createQuestions('who is the prime minister', 'who is the prime minister', 0,function(){
         fetchAnswers(['tiger','who'])
     });
 });
});





exports.createQuestions = createQuestions;



