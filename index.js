var express = require('express'),
  app = express(),
  port = process.env.PORT || 8000;
//   mongoose = require('mongoose'),
//   Patch = require('./api/models/patchModel'),
//   User = require('./api/models/userModel'),
//   bodyParser = require('body-parser'),
//   passport = require("./config/passport"),
//   authRouter = require("./authRoutes")
//
// // mongoose instance connection url connection
// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/PatchDB');
//
//
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());


var routes = require('./routes'); //importing route
routes(app);
app.use(routes)
// var frontendRoutes = require('./frontendRoutes');
// frontendRoutes(app);






app.listen(port);
