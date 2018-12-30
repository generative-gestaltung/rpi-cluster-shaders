var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Patch = require('./api/models/patchModel'),
  User = require('./api/models/userModel'),
  bodyParser = require('body-parser'),
  passport = require("./config/passport"),
  authRouter = require("./authRoutes")

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/PatchDB');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var routes = require('./api/routes/patchRoutes'); //importing route
routes(app); //register the route

var userRoutes = require('./api/routes/userRoutes');
userRoutes(app);


app.use(authRouter)
// var frontendRoutes = require('./frontendRoutes');
// frontendRoutes(app);






app.listen(port);


console.log('todo list RESTful API server started on: ' + port);
