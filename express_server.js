var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
var PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
// tells the Express app to use EJS as its templating engine

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}



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
  let templateVars = {
    username: req.cookies["username"],
    data: urlDatabase
  };
  res.render("urls_index", templateVars);
});


app.post("/login", (req, res) => {
  res.cookie('username', req.body['username']);
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  //   let templateVars = {
  //   username: req.cookies["username"],
  // };
// Create a GET /register endpoint,
// which returns a page that includes a form with an email and password field.
  res.render("register")
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();

// If someone tries to register with an existing user's email
// If the e-mail or password are empty strings,
// send back a response with the 400 status code.
  if(!req.body['email'] || !req.body['password']) {
    // if either are empty strings
    res.statusCode = 400;
    console.log('email/password is required');
    res.status(400).send('Sorry, email/password is required!');
  } else if (findUser(req.body['email'])) {
    // returns true if user email exists in users
      console.log('email already exists');
      res.status(400).send('Sorry, email already exists!');
  } else {
    users[userID] = {
      id: userID,
      email: req.body['email'],
      password : req.body['password']
    };
    res.cookie('user_id', userID);
    res.redirect('urls');
  }

});


app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
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
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id);
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  res.redirect('/urls/'+req.params.id);
  //redirect to url/:id to implement update
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body['longURL'];
  // update/changes longURL for specified shorty
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

function findUser(givenEmail) {

  for(let user in users) {
    person = users[user];
    if(person['email'] === givenEmail) {
      return true;
    }
  }
  return false;

}