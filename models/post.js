var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var User = require('./user.js');

var PostSchema = new Schema({
    title: {type:String, require:true, minlength:1},
    author: {type: ObjectId, requie:true, ref: 'User'},
    content: {type:String, require:true, minlength:1}
});

var Post = mongoose.model('Post', PostSchema);

module.exports = Post;