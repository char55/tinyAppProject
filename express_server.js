var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
// tells the Express app to use EJS as its templating engine

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


var urlDatabase = {
  yo : 'www.google.com',
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  res.render("urls_index", {data: urlDatabase})
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let id = generateRandomString();
  // id is short URL
  urlDatabase[id] = req.body['longURL'];
  //req.body returns object with longURL as key for url submitted
  res.redirect('/urls/'+id)
  // redirects to the page specific to the longURL given
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id);
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  console.log(req.params.id);
  urlDatabase[req.params.id] = req.body['longURL'];
  res.redirect('/urls');
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


function generateRandomString() {
  const possible  = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
  let shorty = '';
  for(let i=0; i<6; i++){
    shorty = shorty + possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return shorty;
}
