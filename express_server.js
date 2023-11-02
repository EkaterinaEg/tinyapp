const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const morgan = require("morgan");
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "qaz",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123",
  },
};

//generate random id
const generateRandomString = () => {
  const result = Math.random().toString(36).substring(5);//set of [0-9,A-Z]
  return result;
 };

const getUserByEmail = function(email) {
  for(let key in users) {
    if(users[key].email === email) {
         return users[key]
    }
  }
  return null
}

// config
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // to get data from cookies
app.set("view engine", "ejs");
app.use(morgan('combined'))


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
  const user = users[id];

  const templateVars = {
    user: user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});
// get request to new form (create new link)
app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id]
  if(!user) {
    return res.redirect('/login');
  
  }
    const templateVars = {
      user: user
  };
  res.render("urls_new", templateVars);
});

//get single link from url database
app.get("/urls/:id", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id]  
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: user};
  res.render("urls_show", templateVars);
});

// Get request to register form
app.get("/register", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id]  
  if(user) {
    return res.redirect('/urls');
  }
  const templateVars = { user };
  res.render("urls_registration", templateVars);
});

// Get request to login form
app.get("/login", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  if(user) {
    return res.redirect('/urls');
  }
  const templateVars = { user };
  res.render("urls_login", templateVars);
});

// using shortURL go to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if(!longURL) {
    return res.send("This id does not exist")
  }
  res.redirect(longURL);
});



// _______________________________________POST requests

// add new link to urlDatabase(handle form submit)
app.post("/urls", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  if(!user) {
    return res.send('Please, login before adding!!!');
  }
  const urlId = generateRandomString();
  urlDatabase[urlId] = req.body.longURL;
  res.redirect(`/urls/${urlId}`);

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
  const id = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;

  if(email === "" || password === "") { 
    return res.status(403).send("E-mail or password are empty")
  }

  const userExists = getUserByEmail(email)
  if(userExists === null) { 
    return res.status(403).send('User was not found')
  }
  if(password !== userExists.password) {
    return res.status(403).send('Password is incorrect')
  }

  users[id] = {id: id, email: email, password: password };

  res.cookie("user_id", id);
  res.cookie("email", email);
  res.cookie("password", password);

  res.redirect('/urls');
});


// logout
app.post('/logout', (req, res) => {
  const user_id = req.body.user_id;
  const email = req.body.email;
  const password = req.body.password;

  res.clearCookie("user_id", user_id);
  res.clearCookie("email", email);
  res.clearCookie("password", password);

  res.redirect('/login');
});

// Register
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if(email === "" || password === "") {
    return res.status(400).send('E-mail or password are empty')
  }

  const userExists = getUserByEmail(email)

  if(userExists !== null) {
    return res.status(400).send('E-mail already exists')
  }
 
  users[id] = {id: id, email: email, password: password };
  res.cookie("user_id", id);
  res.cookie("email", email);
  res.cookie("password", password);

  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});