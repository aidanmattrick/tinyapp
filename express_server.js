const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');

// app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
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

app.use(function (req, res, next) {
  req.user = {};
  req.signedIn = false;
  if (req.cookies.user) {
    req.signedIn = true;
    req.user = users[req.cookies.user];
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  /*"userRandomID:": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },*/
};



//TESTING CODE
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



//Rendering URLs
app.get("/urls", (req, res) => {
  Object.assign(req.templateVars, { urls: urlDatabase });
  res.render('urls_index', req.templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", req.templateVars);
});

//add new URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  Object.assign(req.templateVars, { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] });
  res.render('urls_show', req.templateVars);
});

//Edit redirect to urls
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.url;
  res.redirect("/urls");
});

//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//REGISTER
app.get('/register', (req, res) => {
  Object.assign(req.templateVars, { action: 'register' });
  res.render('urls_register', req.templateVars);
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("username", userID);
  res.redirect("/urls");
});


//Login
app.get('/login', (req, res) => {
  Object.assign(req.templateVars, { action: 'login' });
  res.render('urls_register', req.templateVars);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});