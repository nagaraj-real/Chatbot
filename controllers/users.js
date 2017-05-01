'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var User = require('./../models/user.model');


// get all the users
exports.getAllUsers = function (req, res) {
    User.find({}, function (err, users) {
        if (err) {
            return res.status(400).send({
                message: "error"
            });
        } else {
            res.json(users);
        }
    });
}

// get user by username
exports.getUserByUserName = function (req, res) {
    var _username = req.swagger.params.username.value;
    User.find({ username: _username}, function (err, user) {
        if (err) {
            return res.status(400).send({
                message: "error"
            });
        } else {
            res.json(user);
        }
    });
}

exports.createUser = function (req, res) {
    var user = new User(req.swagger.params.payload.value);

    user.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: err
            });
        } else {
            res.json(user);
        }
    });
}


exports.updateUserByUserName = function (req, res) {
    var params = req.swagger.params.payload.value;
    User.findOneAndUpdate(params.findparam, params.updateparam, function (err, user) {
        if (err) {
            return res.status(400).send({
                message: "error"
            });
        } else {
            res.json(user);
        }
    });

}


exports.validateEmail = function (req, res) {
    var _username = req.swagger.params.username.value;
    var _hash = req.swagger.params.hash.value;

    User.findOneAndUpdate({ username: _username, hash: _hash }, { verified: true }, { new: true }, function (err, user) {
        if (err) {
            return res.status(400).send({
                message: "error"
            });
        } else {
            if (user) {
                res.writeHead(302,
                    { Location: 'http://learn.phoenixaviationmarine.com/#/verified' }
                );
                res.end();
            }
            else {
                return res.status(404).send({
                    message: "not found"
                });
            }

        }

    });
};







