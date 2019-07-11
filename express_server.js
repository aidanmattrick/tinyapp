const _ = require('lodash');
const express = require("express");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcryptSaltRounds = 10;

// const bodyParser = require('body-parser');

// app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: [ 'user_id' ],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const findUserByEmail = function(email) {
  for (let userID in users) {
    if (users[userID].email === email) return users[userID];
  }
  return null;
};

const findURLsForUser = function(user) {
  return _.filter(urlDatabase, { userID: user.id });
};

app.use(function(req, res, next) {
  req.user = {};
  req.signedIn = false;
  if (req.session.user_id) {
    req.signedIn = true;
    req.user = users[req.session.user_id];
  }
  if (req.signedIn && !req.user) {
    delete req.session.user_id;
    req.signedIn = false;
  }
  req.templateVars = {
    user: req.user,
    signedIn: req.signedIn
  };
  next();
});

//console.log(generateRandomString());

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: '1234'
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: '5678'
  }
};

const users = {
  '1234': {
    id: '1234',
    email: 'aidan@example1.com',
    password: bcrypt.hashSync('password', bcryptSaltRounds)
  }, '5678': {
    id: '5678',
    email: 'aidan@example2.com',
    password: bcrypt.hashSync('password', bcryptSaltRounds)
  }
};



//TESTING CODE
app.get("/", (req, res) => {
  if (req.signedIn) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/error", (req, res) => {
  Object.assign(req.templateVars, { message: 'Test Message.' });
  res.render("error", req.templateVars);
});


//Rendering URLs
app.get("/urls", (req, res) => {
  if (!req.signedIn) {
    Object.assign(req.templateVars, { message: 'You must log in to view this page.' });
    res.render("error", req.templateVars);
    return;
    //make sure to input this error for other pages
  }
  Object.assign(req.templateVars, { urls: findURLsForUser(req.user) });
  res.render('urls_index', req.templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.signedIn) {
    return res.redirect('/login');
  }
  res.render("urls_new", req.templateVars);
});

//add new URL
app.post("/urls", (req, res) => {
  if (!req.signedIn) {
    Object.assign(req.templateVars, { message: 'You must be signed in to access this page.' });
    res.render("error", req.templateVars);
    return;
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: req.body.longURL,
    userID: req.user.id
  };
  res.redirect(`/urls/${shortURL}`);
});

//Redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  let url = urlDatabase[req.params.shortURL];
  if (!url) {
    Object.assign(req.templateVars, { message: 'URL does not exist.' });
    res.render("error", req.templateVars);
    return;
  }
  res.redirect(url.longURL);
});

// SHOW URL info with edit form
app.get('/urls/:shortURL', (req, res) => {
  let url = urlDatabase[req.params.shortURL];
  if (!url) {
    Object.assign(req.templateVars, { message: 'URL does not exist.' });
    res.render("error", req.templateVars);
    return;
  } else if (!req.signedIn) {
    Object.assign(req.templateVars, { message: 'You must be signed in to access this page.' });
    res.render("error", req.templateVars);
    return;
  } else if (url.userID != req.user.id) {
    Object.assign(req.templateVars, { message: 'You are not the owner of this URL.' });
    res.render("error", req.templateVars);
    return;
  }
  Object.assign(req.templateVars, { url: url });
  res.render('urls_show', req.templateVars);
});

// Submit edit to url
app.post("/urls/:shortURL", (req, res) => {
  let url = urlDatabase[req.params.shortURL];
  if (!url) {
    Object.assign(req.templateVars, { message: 'URL does not exist.' });
    res.render("error", req.templateVars);
    return;
  } else if (!req.signedIn) {
    Object.assign(req.templateVars, { message: 'You must be signed in to access this page.' });
    res.render("error", req.templateVars);
    return;
  } else if (url.userID != req.user.id) {
    Object.assign(req.templateVars, { message: 'You are not the owner of this URL.' });
    res.render("error", req.templateVars);
    return;
  }
  url.longURL = req.body.url;
  res.redirect("/urls");
});

//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let url = urlDatabase[req.params.shortURL];
  if (!url) {
    Object.assign(req.templateVars, { message: 'URL does not exist.' });
    res.render("error", req.templateVars);
    return;
  } else if (!req.signedIn) {
    Object.assign(req.templateVars, { message: 'You must be signed in to access this page.' });
    res.render("error", req.templateVars);
    return;
  } else if (url.userID != req.user.id) {
    Object.assign(req.templateVars, { message: 'You are not the owner of this URL.' });
    res.render("error", req.templateVars);
    return;
  }
  delete urlDatabase[url.shortURL];
  res.redirect('/urls');
});

//REGISTER
app.get('/register', (req, res) => {
  Object.assign(req.templateVars, { action: 'register' });
  res.render('urls_register', req.templateVars);
});

app.post("/register", (req, res) => {
  if (req.signedIn) return res.redirect('/urls');
  if (req.body.email === "" || req.body.password === "") {
    Object.assign(req.templateVars, { message: 'You must supply both an email and a password to register.' });
    res.render("error", req.templateVars);
    return;
  } else if (findUserByEmail(req.body.email)) {
    Object.assign(req.templateVars, { message: 'This email address is already in use.' });
    res.render("error", req.templateVars);
    return;
  }
  let userID = generateRandomString();
  let cryptedPassword = bcrypt.hashSync(req.body.password, bcryptSaltRounds);
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: cryptedPassword
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});


//Login
app.get('/login', (req, res) => {
  if (req.signedIn) return res.redirect('/urls');
  Object.assign(req.templateVars, { action: 'login' });
  res.render('urls_register', req.templateVars);
});

app.post("/login", (req, res) => {
  let user = findUserByEmail(req.body.email);
  if (!user) {
    Object.assign(req.templateVars, { message: 'User does not exist.' });
    res.render("error", req.templateVars);
    return;
  } else if (!bcrypt.compareSync(req.body.password, user.password)) {
    Object.assign(req.templateVars, { message: 'Invalid password.' });
    res.render("error", req.templateVars);
    return;
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//Logout
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});