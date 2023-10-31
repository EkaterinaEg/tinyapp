const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// config
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
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

// get request to new form (create new link)
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//get single link from url database
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],  username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

// using shortURL go to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});
// upload urls page
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
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
  res.redirect('/urls')
  
});
// Delete url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
});

// login
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect('/urls')
})

// logout
app.post('/logout', (req, res) => {
  const username = req.body.username;
  res.clearCookie("username", username);
  res.redirect('/urls')
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//generate random id
  function generateRandomString() {
    const result = Math.random().toString(36).substring(5)//set of [0-9,A-Z]
    return result
 
  }


