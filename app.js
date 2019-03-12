// bring in our dependencies
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const Handlebars = require('hbs');
const indexRouter = require('./routes/index');

// create our express app
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// register middleware
app.use(helmet({
  frameguard: false,
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// register our routes
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// used to return a number for the blank book cover images
Handlebars.registerHelper('onetwothree', index => (index % 3) + 1);

// used for setting the value of a select input
Handlebars.registerHelper('isSelected', (value1, value2) => (value1 === value2 ? 'selected' : ''));

// used for making strings safe for JS
Handlebars.registerHelper('safeStr', (str) => {
  const res = (str) ? str.replace(/[']/gi, "\\'") : '';
  return res;
});

module.exports = app;
