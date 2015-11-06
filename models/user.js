var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);


var Schema = mongoose.Schema;
var UserSchema = new Schema({
    email: {type: String, require: true, unique: true },
    password: {type:String, require: true}
});

//create new user with secure and salted hashed password
UserSchema.statics.createSecure = function (email, password, callback){
  //var to hold this instance
  var user = this;

  //hash password user enters at sign up
  bcrypt.genSalt(function(err, salt){
    bcrypt.hash(password, salt, function(err, hash){

      // create new user and save to database
      user.create({
        email: email,
        password: hash
      }, callback);
    });
  });
};
// authenticate user at log in
UserSchema.statics.authenticate = function(email,password, callback){
  //find user by email entered at login
  this.findOne({email: email}, function(err, user){

    //throw error if can't find user
    if(!user){
      console.log('No user with email ' + email);
    } else if (user.checkPassword(password) ){
      callback(null, user);
    }
  });
};

// compare password user enters with hadded password
UserSchema.methods.checkPassword = function(password) {
  //run bcypt compare hash to user inputed password 
  return bcrypt.compareSync(password, this.password);
};

var User = mongoose.model('User', UserSchema);

module.exports = User;