const express = require('express');
const app = express();
const PORT = 8080;


const cookieSession = require('cookie-session')
const morgan = require("morgan");
const bcrypt = require("bcryptjs");

const { getUserByEmail } = require('./helpers') 



const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  i3B: {
    longURL: "https://www.google.ca",
    userID: "aJ48l",
  },
  itywe: {
    longURL: "https://www.google.ca",
    userID: "aJ4",
  },
  12: {
    longURL: "https://www.google.ca",
    userID: "aJ4",
  },
};


const users = {
  aJ4: {
    id: "aJ4",
    email: "user@example.com",
    password: "$2a$10$TfUThAL/OhKap97kNuGigOeoXTG2zDKBTCez0LsvrMC/iBQpQC71.",
  },
 
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123",
  },
};

//generate random id
const generateRandomString = () => {
  const result = Math.random().toString(36).substring(2,8);
  return result;
 };


const urlsForUser = function(id) {
 let  urls = {}
  for(let key in urlDatabase) {
    const links = urlDatabase[key]
    if(links.userID === id) {
      urls[key] = urlDatabase[key]
}
  }
  return urls
}

// config
app.set("view engine", "ejs");


// middleware
app.use(express.urlencoded({ extended: true })); // creates req.body

app.use(morgan('combined'))

app.use(cookieSession({
  name: 'session',
  keys: ['fasdklfhaklsdhfklas'],
}));



// get request to /
app.get("/", (req, res) => {
  res.redirect("/login")
});

// UrlDatabase in json format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// route to /hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// urls page
app.get("/urls", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  
  if(!user) {
    return res.send("Please <a href='/login'>Login</a> or <a href='/register'>Register</a>")
  }

  //check urls of user
  const usersUrls = urlsForUser(id); 

  const templateVars = { user, urls: usersUrls };
      
  res.render("urls_index", templateVars);
});


// get request to new form (create new link)
app.get("/urls/new", (req, res) => {
  const id = req.session.userId;
  const user = users[id]

  if(!user) {
    return res.redirect('/login');
  }
  
  const templateVars = { user };
  
  res.render("urls_new", templateVars);
});

//get single link from url database
app.get("/urls/:id", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  const urlId = req.params.id;

  if(!user) {
    return res.send("Please <a href='/login'>Login</a> or <a href='/register'>Register</a>")
  }
  if(!urlDatabase[urlId]) {
    return res.send("This url does not exist")
  }

  if(urlDatabase[urlId].userID !== id) {
    return res.send("This is not your url")
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user };

  res.render("urls_show", templateVars);
});

// using shortURL go to longURL
app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;
 

  if(!urlDatabase[urlID]) {
    return res.send("This url does not exist")
  }

  const longURL = urlDatabase[urlID].longURL;

  if(!longURL) {
    return res.send("This url does not exist")
  }
  res.redirect(longURL);
});

// Get request to register form
app.get("/register", (req, res) => {
  const id = req.session.userId;
  const user = users[id]  
 
  if(user) {
    return res.redirect('/urls');
  }
  const templateVars = { user };
  res.render("urls_registration", templateVars);
});

// Get request to login form
app.get("/login", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  
  if(user) {
    return res.redirect('/urls');
  }
  const templateVars = { user };

  res.render("urls_login", templateVars);
});





// _______________________________________POST requests

// add new link to urlDatabase(handle form submit)
app.post("/urls", (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  if(!user) {
    return res.send("Please <a href='/login'>Login</a> or <a href='/register'>Register</a>");
  }
  const urlId = generateRandomString();

  urlDatabase[urlId] = { userID: id, longURL: req.body.longURL };

  res.redirect(`/urls/${urlId}`);
});

// Edit url
app.post("/urls/:id", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  const urlId = req.params.id;
  const newLongURL = req.body.UpdatedlongURL;

  if(!user) {
    return res.send("Please <a href='/login'>Login</a> or <a href='/register'>Register</a>");
  }


  urlDatabase[urlId].longURL = newLongURL;

  res.redirect('/urls');
  
});
// Delete url
app.post("/urls/:id/delete", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  const urlId = req.params.id;

  if(!user) {
    return res.send("Please <a href='/login'>Login</a> or <a href='/register'>Register</a>");
  }

  if(urlDatabase[urlId].userID !== id) {
    return res.send("This is not your url")
  }


  delete urlDatabase[urlId];
  // delete usersUrls[req.params.id];
  res.redirect('/urls');
});

// login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;


  if(!email || !password) { 
    return res.status(403).send("E-mail or password is empty")
  }

  const userExists = getUserByEmail(email, users);


  if(!userExists) { 
    return res.status(403).send('User was not found')
  }

  const result = bcrypt.compareSync(password, userExists.password);
  
  if(!result) {
    return res.status(403).send('Password is incorrect')
  }

  req.session.userId = userExists.id; 
  req.session.email = email; 
  req.session.password = userExists.password; 
  
  res.redirect('/urls');
});


// logout
app.post('/logout', (req, res) => {

  req.session = null;

  res.redirect('/login');
});

// Register
app.post('/register', (req, res) => {
    // const id = 'aJ48lW';// for testing
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);



  if(!email || !password) {
    return res.status(400).send('E-mail or password is empty')
  }

  const userExists = getUserByEmail(email, users);

  if(userExists) {
    return res.status(400).send('E-mail already exists')
  }
 
  
  users[id] = {id, email, password: hashedPassword }; 

  req.session.userId = id; 
  req.session.email = email; 
  req.session.password = hashedPassword; 

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
