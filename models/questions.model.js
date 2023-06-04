'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;




/**
 * Question Schema
 */
var QuestionSchema = new Schema({
  question: {
    type: String,
    default: '',
    trim: true
  },
  answer: {
    type: String,
    default: '',
    trim: true
  }
});

/**
 * Questions Schema
 */
var QuestionsSchema = new Schema({
  questions: [QuestionSchema]
});



var questionsmodel = mongoose.model('Questions', QuestionsSchema);
module.exports = questionsmodel;