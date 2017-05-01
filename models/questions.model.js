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
  },
  count: {
    type: Number,
    default: 0
  },
  nouns: [String]
});

/**
 * Questions Schema
 */
var QuestionsSchema = new Schema({
  questions: [QuestionSchema]
});



var questionsmodel = mongoose.model('Questions', QuestionsSchema);
module.exports = questionsmodel;