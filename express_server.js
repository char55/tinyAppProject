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
  "jo": {
    id: "jo",
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
    user: users[req.cookies['user_id']],
    data: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users,
  };
  res.render("login");
});



app.post("/login", (req, res) => {
// In order to do this, the endpoint will first need to try and find a user that matches the email submitted via the login form. If a user with that e-mail cannot be found, return a response with a 403 status code.

// If a user with that e-mail address is located, compare the password given in the form with the existing user's password. If it does not match, return a response with a 403 status code.

// If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /.

  if(findUser(req.body['email'])) {
    //find if user exists
    const userID = findUser(req.body['email']);

    if(users[userID]['password'] === req.body['password']) {
      // password matches
      res.cookie('user_id', userID);
      res.redirect('/');
    } else {
      // bad password for user
      console.log('bad password for user');
      res.status(403).send('The password entered does not match the email entered');
    }

  } else {
    // user does not exists
    console.log('user does not exists');
    res.status(403).send('The email entered is not registered to any known user');
  }


});

app.get("/register", (req, res) => {
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
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
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
    user : users[req.cookies["user_id"]],
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
      return person['id'];
    }
  }
  return false;

}