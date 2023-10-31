const express = require('express');
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.use(express.urlencoded({ extended: true }));



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
  // console.log(urlDatabase);
  // console.log(req.body); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.set("view engine", "ejs");
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



  function generateRandomString() {
    const characters = 'abcdefghijklmnopqrstuvwxyzZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXY';
    let shortUrl = [];
    for (let i = 0; i < 6; i++) {
      shortUrl.push(Math.floor(Math.random() * characters.length))
  
    }
  
  return shortUrl.map(el => characters.charAt(el)).join("")
  
  
  }


