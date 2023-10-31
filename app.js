import { createError }from 'http-errors'
import express from 'express';
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import indexRouter from './routes'
import usersRouter from './routes/users'
import {configDotenv} from "dotenv";
configDotenv();
const app = express();
import passport from '../services/passport.js';
import session from "express-session";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(passport.initialize());
app.use(passport.session());

// Middleware used in protected routes to check if the user has been authenticated
const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
}
// Base route
app.get("/home", (req, res) => {
  res.send("Home Page")
})

// Google Auth consent screen route
app.get('/google',
    passport.authenticate('google', {
          scope:
              ['email', 'profile']
        }
    ));

// Call back route
app.get('/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/failed',
    }),
    function (req, res) {
      res.redirect('/success')

    }
);

// failed route if the authentication fails
app.get("/failed", (req, res) => {
  console.log('User is not authenticated');
  res.send("Failed")
})

// Success route if the authentication is successful
app.get("/success",isLoggedIn, (req, res) => {
  console.log('You are logged in');
  res.send(`Welcome ${req.user.displayName}`)
})

// Route that logs out the authenticated user
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Error while destroying session:', err);
    } else {
      req.logout(() => {
        console.log('You are logged out');
        res.redirect('/home');
      });
    }
  });
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
