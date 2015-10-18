//server

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

//Middle ware
app.use(express.static('public'));

app.set('view engine', 'ejs');

//Routes
//Get root
app.get('/', function(req, res){

  res.render('index',{});
});

//listen
app.listen(3000, function(){
  console.log("Lets get it started in here, port 3000");
});

