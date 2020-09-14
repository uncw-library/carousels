const express = require('express')
const cookieParser = require('cookie-parser')
const createError = require('http-errors')
const favicon = require('serve-favicon')
const helmet = require('helmet')
const Handlebars = require('hbs')
const logger = require('morgan')
const path = require('path')

const indexRouter = require('./routes/index')


const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(favicon(path.join(__dirname, 'public', 'images', 'seahawk.ico')))
app.use(helmet({
  frameguard: false
}))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))


app.use('/', indexRouter)

/*
 if the request doesn't match a route above,
 create a 404 error
*/

app.use((req, res, next) => {
  next(createError(404))
})

/*
error handler
*/

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  console.error(err.stack)
  res.locals.message = err.message
  // send error details to view only in development
  res.locals.error = app.get('env') === 'development' ? err : {}
  res.render('error')
})

// Handlebars custom plugins

// used to return a number for the blank book cover images
Handlebars.registerHelper('onetwothree', index => (index % 3) + 1)

// used for setting the value of a select input
Handlebars.registerHelper('isSelected', (value1, value2) => (value1 === value2 ? 'selected' : ''))

// used for making strings safe for JS
Handlebars.registerHelper('safeStr', (str) => {
  const res = (str) ? str.replace(/[']/gi, "\\'") : ''
  return res
})

module.exports = app
