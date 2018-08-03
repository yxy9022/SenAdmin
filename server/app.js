const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const lessMiddleware = require('less-middleware');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const ErrorCode = require('./tools/ErrorCode');
const index = require('./routes/index');

const $FileStore = new FileStore({
  ttl: 3600 * 24,
  logFn: function (err) {
  }
});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '30mb'}));
app.use(bodyParser.urlencoded({limit: '30mb', extended: false}));
app.use(cookieParser());
app.use(session({
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 7 * 24 * 60 * 60 * 1000},  //设置maxAge是7天，即7天后session和相应的cookie失效过期
  secret: 'sen_admin',
  store: $FileStore,
}));
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.success = function (data) {
    return res.json(_.merge({data: data}, ErrorCode.OK));
  };
  res.fail = function () {
    return res.json(ErrorCode.FAILED);
  };
  next();
});

app.use('/', index.router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
