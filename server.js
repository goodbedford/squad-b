//server

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = require('./models/index.js');

//connect db
mongoose.connect("mongodb://localhost/squad");

//Middle ware
app.use(express.static('public'));
//views
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true })); 

//Routes
//Get root
app.get('/', function(req, res){
  db.Post.find({}, function(err, posts){
    console.log("Posts from db on home", posts);
    res.render('index', {posts:posts});
  });
});
//GET Post
app.get('/api/posts', function(req, res){
  db.Post.find({}, function(err, posts){
    console.log("Posts from db", posts);
    res.json(posts);
  });
});


//POST
app.post('/api/posts', function(req, res){
  var newPost = req.body;
  
  db.Post.create(newPost, function(err, post){
    res.json(post);
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
//PUT
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

//POST User
app.post('/api/users', function(req, res){
  db.User.createSecure(req.body.email, req.body.password, function(err, user){
    console.log("this is the user:", user);
    res.redirect('/');
  });
});

//GET Login
app.get('/login', function(req, res){
 res.render('login');
});

//POST Login
app.post('/login', function(req, res){
   db.User.authenticate(req.body.email, req.body.password, function(err, user){
    console.log("this user is login",user);

    res.redirect('/');
   });

});

app.get('/signup', function(req, res){
  res.render('signup');
});




//listen
app.listen(3000, function(){
  console.log("Lets get it started in here, port 3000");
});

