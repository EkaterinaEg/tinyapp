const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//generate random id
const generateRandomString = () => {
  const result = Math.random().toString(36).substring(5);//set of [0-9,A-Z]
  return result;
 
};

// config
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // to get username from cookies
app.set("view engine", "ejs");


// get request to /

app.get("/", (req, res) => {
  res.send("Hello!");
});

// UrlDatabase in json format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// route to /hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
// upload urls page
app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;

  const user = users[id]
  // console.log(users[req.cookies.user_id]);
  // console.log(users[id]);
  const templateVars = {
    user : user,
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});
// get request to new form (create new link)
app.get("/urls/new", (req, res) => {
  // const templateVars = { username: req.cookies["username"] };
  const user = users[req.cookies.user_id]
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

//get single link from url database
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id]
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],  user };
  res.render("urls_show", templateVars);
});

// Get request to register form
app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id]
  const templateVars = { user };
  res.render("urls_registration", templateVars);
});

// using shortURL go to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});



// _______________________________________POST requests

// add new link to urlDatabase(handle form submit)
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);

});

// Edit url
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.UpdatedlongURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
  
});
// Delete url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// login
app.post('/login', (req, res) => {
  // const user = users[req.cookies.user_id]
  // const templateVars = { user };
  const username = req.body.username
  res.cookie("username", username);
  res.redirect('/urls');
});


// logout
app.post('/logout', (req, res) => {
  // const username = req.body.username;
  // res.clearCookie("username", username);
  const user = users[req.cookies.user_id]
  const templateVars = { user };
    // res.clearCookie("username", username);
    
  res.redirect('/urls');
});



// Register
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[id] = {id: id, email: email, password: password };
 
  
  res.cookie("user_id", id);
  res.cookie("email", email);
  res.cookie("password", password);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});