//dotenv
require('dotenv').config();
// DEPENDENCIES
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3000;
const User = require('./models/user.js')
const morgan = require ('morgan')
const connectionURI = process.env.MONGODB_URI;



// MIDDLEWARE
app.set(morgan('dev'))
// body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// static files middleware
app.use(express.static('public'))
//session middleware
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));

app.use( addUserToRequest = (req, res, next)=> {
  if (req.user) {
    return next();
  }
  if(req.session && req.session.userId) {
        User.findById(req.session.userId, function(err, foundUser) {
            req.user = foundUser;
            next();
        });
    } else {
        next();
    }
  }
)


// CONTROLLERS
// fitting room three
const roomController = require('./controllers/room.js');
app.use('/room', roomController);
// create new users
const userController = require('./controllers/users.js');
app.use('/users', userController);

const isLoggedIn = (req, res, next)=> {
  if (req.user !== undefined) {
    return res.redirect('/room');
  }
  next()
}

// GET INDEX
app.get('/', isLoggedIn,(req, res) => {
  res.render('index.ejs', {});
});


// SEED ROUTE
const seed = require('./models/seed.js');

app.get('/seedAgents', (req, res) => {
  // encrypts the given seed passwords
  seed.forEach((user) => {
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
  });
  // seeds the data
  User.create(seed, (err, createdUsers) => {
    // logs created users
    console.log(createdUsers);
    // redirects to index
    res.redirect('/');
  });
});



mongoose.connect(connectionURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});
mongoose.connection.once('open', () => {
  console.log('connected to mongo');
});

app.listen(port, () => {
  console.log('listening on port: ', port);
});