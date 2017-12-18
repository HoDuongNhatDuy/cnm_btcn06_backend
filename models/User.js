var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema(
    {
        username: {type: String, unique: true, required: true},
        email: {type: String, unique: true, required: true},
        password: {type: String, required: true}
    }
);

//Export model
var User = module.exports = mongoose.model('User', UserSchema, 'users');

module.exports.CreateUser = function (newUser, callback) {
    bcrypt.hash(newUser.password, 10, function(err, hash) {
        newUser.password = hash;
        newUser.save(callback);
    });
};

module.exports.GetByUsername = function (username, callback) {
    var query = {username: username};
    User.findOne(query, callback);
};

module.exports.ComparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
};