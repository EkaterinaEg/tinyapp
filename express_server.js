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
  userRandomID: {
    id: "aJ4",//for testing purposes
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
  const result = Math.random().toString(36).substring(5);//set of [0-9,A-Z]
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
  const id = req.session.userId;
  const user = users[id];
  if(!user) {
    return res.send("Plase login or register")
  }

  const usersUrls = urlsForUser(id);

  if(Object.keys(usersUrls).length === 0) {
    return res.send("Sorry, you do not have any URLs")
  } 
      const templateVars = {
        user: user,
        urls: usersUrls
      };
     res.render("urls_index", templateVars);
});

// get request to new form (create new link)
app.get("/urls/new", (req, res) => {
  const id = req.session.userId;
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
  const id = req.session.userId;
  const user = users[id]
  if(!user) {
    return res.send("Plase login or register to see urls")
  }
  
  if(!urlDatabase[req.params.id]) {
    return res.send("This url does not exist")
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: user};
  res.render("urls_show", templateVars);
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

// using shortURL go to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if(!longURL) {
    return res.send("This url does not exist")
  }
  res.redirect(longURL);
});



// _______________________________________POST requests

// add new link to urlDatabase(handle form submit)
app.post("/urls", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  if(!user) {
    return res.send('Please, login before adding!!!');
  }
  const urlId = generateRandomString();
  urlDatabase[urlId] = { userID: id, longURL: req.body.longUR };
  res.redirect(`/urls/${urlId}`);
});

// Edit url
app.post("/urls/:id", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  if(!user) {
    return res.send('Please, login!');
  }
  const urlId = req.params.id;
  const newLongURL = req.body.UpdatedlongURL;


  urlDatabase[urlId].longURL = newLongURL;
  res.redirect('/urls');
  
});
// Delete url
app.post("/urls/:id/delete", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  const urlId = req.params.id;

  if(!user) {
    return res.send('Please, login!');
  }
  // const usersUrls = urlsForUser(id);
  if(!urlDatabase[urlId]) {
    return res.send("This url does not exist")
  }


  delete urlDatabase[urlId];
  // delete usersUrls[req.params.id];
  res.redirect('/urls');
});

// login
app.post('/login', (req, res) => {
  const id = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;
  // const hashedPassword = bcrypt.hashSync(password, 10);

  if(email === "" || password === "") { 
    return res.status(403).send("E-mail or password are empty")
  }

  const userExists = getUserByEmail(email, users);

  if(userExists === null) { //check to change to just if(!userExists)
    return res.status(403).send('User was not found')
  }

  const result = bcrypt.compareSync(password, userExists.password);
  if(!result) {
    return res.status(403).send('Password is incorrect')
  }

  users[id] = {id: id, email: email, password: userExists.password };

  req.session.userId = id; 
  req.session.email = email; 
  req.session.password = userExists.password; 

  res.redirect('/urls');
});


// logout
app.post('/logout', (req, res) => {
  const userId = req.body.userId;
  const email = req.body.email;
  const password = req.body.password;

  req.session = null


  res.redirect('/login');
});

// Register
app.post('/register', (req, res) => {
    // const id = 'aJ48lW';// for testing
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);



  if(email === "" || password === "") {
    return res.status(400).send('E-mail or password are empty')
  }

  const userExists = getUserByEmail(email, users)

  if(userExists !== null) {
    return res.status(400).send('E-mail already exists')
  }
 
  
  users[id] = {id: id, email: email, password: hashedPassword }; 

  req.session.userId = id; 
  req.session.email = email; 
  req.session.password = hashedPassword; 

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});