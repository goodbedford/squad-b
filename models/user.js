var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var UserSchema = new Schema({
    title: String,
    author: String,
    content: String
});

var User = mongoose.model('User', UserSchema);

module.exports = User;