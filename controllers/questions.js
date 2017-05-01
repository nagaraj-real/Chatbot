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


var createQuestions = function (_question, answer, counter) {
    console.log(_question);
    var questions = [];




    wordpos.getPOS(_question, function (result) {
        var question = {
            question: _question,
            answer: answer,
            counter: counter,
            nouns: ''
        };
        console.log(result);
        var nouns = _.difference(result.nouns, result.adjectives);
        question.nouns = nouns;
        console.log(nouns);
        questions.push(question);
        var question = new Questions({ questions: questions });

        question.save(function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(data);
            }
        });
    });


};


var fetchAnswers = function (noun) {
    Questions.findOne({ 'questions': { $elemMatch: { nouns: {$in:noun} } } }, function (err, docs) {
        if (err)
            console.log(err);
        else{
            console.log(docs.questions[0].answer);
            console.log(docs.questions[0].nouns[0]);
        }
    });

};

createQuestions('what is a bear', 'nothing', 0);
fetchAnswers(['bear','tiger']);


exports.createQuestions = createQuestions;



