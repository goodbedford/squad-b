//server

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = require('./models/index.js');
var session = require('express-session');
var path = require('path');

//connect db
mongoose.connect("mongodb://localhost/squad");

//Middle ware
app.use(express.static(path.join(__dirname,'/public')));
//views
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true })); 
//session
app.use(session({
  savedUninitialized: true,
  resave: true,
  secret: "SuperGoodBedford",
  cookie: {maxAge: (1000 * 60 * 2)} //2hours
}));
//mangage session
app.use('/', function(req, res, next){
  //saves userId in session for login in user
  req.login = function(user) {
    req.session.userId = user._id;
  };

  //find current user by  
  req.currentUser = function(callback){
    db.User.findOne({_id: req.session.userId}, function(err, user){
      req.user = user;
      if(!user){
        callback("There is no user login in", null);
        return;
      }
      callback(null, user);
    });
  };
  // destroy session.userId to log out user
  req.logout = function(){
    req.session.userId = null;
    req.user = null;
  };

  req.flash = function(err){
    console.log("err in flash:", err);
    res.locals.flash = {};
    res.locals.flash.err = err;
    console.log("locals.flash:", res.locals.flash);
  };

  next();
});

//Error handling
app.use(errorHandler);

function errorHandler(err, req, res, next){
  console.log("goodbed");
  if (res.headersSent){

  }
  console.error(err.stack);
  res.status(500);
  res.render('signup', {error:err});
  //next(err);
}


//Routes
//Get root
app.get('/', function(req, res){
    req.currentUser(function(err,currentUser){
      var user = currentUser || null;
      db.Post.find({}, function(err, posts){
        //console.log("Posts from db on home", posts);
        res.render('index', {posts:posts, user:user});
      });
    });
});
//GET Post
app.get('/api/posts', function(req, res){
  db.Post.find({}, function(err, posts){
    console.log("Posts from db", posts);
    res.json(posts);
  });
});


//POST post
app.post('/api/posts', function(req, res){
  var newPost = req.body;

  req.currentUser(function(err, user){
    if (user){
      console.log("this a login in user", user);
      db.Post.create(newPost, function(err, post){
        res.json(post);
      });
    }else{
      console.log("You are not login in");
      res.json(err);
    }
  }); 

});
//DELETE
app.delete('/api/posts/:id', function(req, res){
  var postId = req.params.id;
  db.Post.findOneAndRemove({_id: postId}, function(err, deletedPost){
    console.log("Deleted post id", postId);
    res.json(postId);
  });
});
//PUT Post
app.put('/api/posts/:id', function(req, res){
  var postId = req.params.id;
  var updatedPost = req.body;
  updatedPost._id = postId;
  console.log("the updated post", updatedPost);

  db.Post.findByIdAndUpdate({_id: postId}, updatedPost, function(err, post){
    db.Post.findOne({_id: post._id}, function(err, updated){ 
     console.log("updated & saved Post is ",updated);
      res.json(updated);
    });
  });
});
//GET User
app.get('/api/users', function(req, res){
  db.User.find({}, function(err, users){
    res.json(users);
  });
});
//GET current User
app.get('/api/users/current', function(req, res){
  req.currentUser(function(err, user){
    res.json(user);
  });
});


//POST User
app.post('/api/users', function(req, res, next){
  console.log("the post body:", req.body);
  db.User.createSecure(req.body.email, req.body.password, function(err, user){
    // console.log("this is the user:", user);
    //console.log("the err:", err.message);
    if(err){
      console.log("some error");
      req.session.err = {errmsg: "Email is already registered."};
      //console.log(req.session.err);
      //pass err to global flash obj
      //req.flash(req.session.err);
      res.redirect('/signup');
      return;
    }else{
      //start session
      req.login(user);
      res.redirect('/');
    }
  });
});

//GET Login
app.get('/login', function(req, res){
 res.render('login',{user:null});
});

//POST Login
app.post('/login', function(req, res){
   db.User.authenticate(req.body.email, req.body.password, function(err, user){
    console.log("this user is login",user);
    //start session
    req.login(user); 
    res.redirect('/'); 
   });

});
// get signup page
app.get('/signup', function(req, res){
  if(req.session.err){
    console.log("running error script");
    req.flash(req.session.err);
    res.render('signup',{user:null});
    req.session.err = null;
    req.flash(req.session.err);
    return;
  }
  console.log("signup no error");
  res.render('signup',{user:null, flash:{err:null}});
});

//get logout User
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


//listen
app.listen(3000, function(){
  console.log("Lets get it started in here, port 3000");
});

