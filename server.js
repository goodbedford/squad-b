//server

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = require('./models/index.js');
var session = require('express-session');
var path = require('path');
var flash = require('connect-flash');

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
//Session Flash Message
app.use(flash());

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
  next();
});


//Routes
//Get root
app.get('/', function(req, res){
    req.currentUser(function(err,currentUser){
      var user = currentUser || null;
      db.Post.find({})
        .populate('author')
        .exec(function(err, posts){
          // console.log("Posts from db on home", posts);
          res.render('index', {posts:posts, user:user});
        });
    });
});
//GET Post
app.get('/api/posts', function(req, res){
  req.currentUser(function(err, currentUser){
    var user = currentUser || null;
    if(user){
      db.Post.find({})
        .populate('author')
        .exec(function(err, posts){
          // console.log("Posts from db on home", posts);
          res.render('index', {posts:posts, user:user});
        });
    } else {
      console.log("Could not get posts.");
      res.render('index', {posts:posts, user:user});
    }
  });
});


//POST post
app.post('/api/posts', function(req, res){
  var newPost = req.body;

  req.currentUser(function(err, user){
    if (user){
      console.log("this a login in user", user);
      db.Post.create(newPost, function(err, post){
        if(err){
          console.log("Error while posting");
          error = 'Error while posting.';
          res.status(404).json(error);
          return;
        }
        db.Post.findOne({_id: post._id})
          .populate('author')
          .exec(function(err,post){
            if(err){
              console.log("Error while posting");
              res.status(404).json(err);
              return;
            }
            console.log("success created post");
            res.json(post); 
          });
      });
    }else{
      console.log("Need to login to post.");
      res.status(400).json(err);
    }
  }); 

});
//POST post2
app.post('/posts2', function(req, res){
  var newPost = req.body;

  req.currentUser(function(err, currentUser){
    var user = currentUser || null;

    if (user){
      console.log("this a login in user", user);
      db.Post.create(newPost, function(err, post){
        if(err){
          console.log("Error while posting");
          error = 'Error while posting.';
          //res.status(404).json(error);
          return;
        }
        db.Post.find({})
          .populate('author')
          .exec(function(err,posts){
            if(err){
              console.log("Error while posting");
              //res.status(404).json(err);
              return;
            }
            console.log("success created post");
            res.render('index', {posts:posts, user:user});
            // res.json(post); 
          });
      });
    }else{
      console.log("Need to login to post.");
      //res.status(400).json(err);
    }
  }); 

});
//DELETE
app.delete('/api/posts/:id', function(req, res){
  req.currentUser(function(err,currentUser){
    if(currentUser){
      var postId = req.params.id;
      db.Post.findOneAndRemove({_id: postId}, function(err, deletedPost){
        console.log("Deleted post id", postId);
        res.json(postId);
      });
    } else {
      console.log("You don't have the correct permissions.");
      res.status(403).json(err);
    }
  });
});
//Update post by  method post instead of put
app.post('/posts/:id', function(req, res){
  req.currentUser(function(err,currentUser){
    var user = currentUser || null;
    if(user){
      var postId = req.params.id;
      //console.log("req.params.id:", req.params.id);
      var updatedPost = req.body;
      updatedPost._id = postId;
      //console.log("the post to be updated with", updatedPost);
      db.Post.findByIdAndUpdate({_id: postId}, updatedPost, function(err, post){
        console.log("the updated post1:", post);
        if( post.author !== user._id){
          console.log("Current user does not have permissons to edit");
          res.redirect('/');
          return;
        }
        db.Post.find({})
          .populate('author')
          .exec(function(err, posts){ 
            if(err){
              console.log("Error while updating post");
              //res.status(404).json(err);
              return;
            }
            console.log("success updated post");
            res.redirect('/');
            //res.render('index', {posts:posts, user:user});
          });
      });
    } else {
      console.log("error updating.");
    }
            //console.log("updated & saved Post is ",posts);
          // res.json(updated);
  });
});
//GET User
app.get('/api/users', function(req, res){
  req.currentUser(function(err, currentUser){
    if(currentUser){
      db.User.find({}, function(err, users){
        res.json(users);
      });
    } else {
      res.status(403).json("You don't have correct permissions.");
    }
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
      //Add Flash Middleware Error Message
      req.flash('flash', "Email is already registered." );
      res.redirect('/signup');
      return;
    }else{
      //start session
      req.login(user);
      res.redirect('/');
    }
  });
});

//Get Guest user
app.get('/login/guest', function(req, res){
  var guest = {
        email: "bob@gmail.com",
        password: "bob"
  };
  db.User.authenticate(guest.email, guest.password, function(err, user){
   console.log("this user is login",user);
   //start session
   req.login(user); 
   res.redirect('/'); 
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
  console.log("signup no error");
  res.render('signup',{user:null, flash:req.flash('flash') });
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

