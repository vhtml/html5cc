var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var user = require('./routes/user');
var rss = require('./routes/rss');
var config = require('./config');

require('./lib/console.js');

var app = express();

// view engine setup
var template = require('./lib/template.js');
app.engine('.html', template.__express);
app.set('view engine', 'html');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(session({
  secret: config.secret,
  key: config.key,
  resave: false,//don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * config.cookie_day
  }, //d days
  store: new MongoStore({
    url: config.dbUrl,
    touchAfter: 24 * 3600 // time period in seconds
  })
}));
app.use('/static', express.static(path.join(__dirname, 'public')));


//路由前拦截设置
app.use(function(req, res, next){
  res.locals.user = null;
  if(req.session.user){
    res.locals.user = req.session.user;
  }
  next();
});
//路由
app.use('/', routes);
app.use('/user', user);
app.use('/rss', rss);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;