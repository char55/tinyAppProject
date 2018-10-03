var express = require("express");
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
var app = express();
var PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
// tells the Express app to use EJS as its templating engine

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['choco', 'vanilla', 'rainbow', 'doubletrouble' ],
}));



const users = {
  "jo": {
    id: "jo",
    email: "user@example.com",
    password: bcrypt.hashSync("k", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }

}

const urlDatabase = {
    yo : {
      id: 'jo',
      short: 'yo',
      long: "http://www.google.com"
    },
    'b2xVn2' : {
      id: 'user2RandomID',
      short: 'b2xVn2',
      long: 'http://www.lighthouselabs.ca'
    },
    '9sm5xK' : {
      id: 'jo',
      short: '9sm5xK',
      long: "http://www.google.com"
    }
}


/*var urlDatabase = {
  yo : 'www.google.com',
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};*/


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const objUser = urlsForUser(req.session['user_id']);
  let templateVars = {
    user: users[req.session['user_id']],
    data: objUser
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


  if(findUser(req.body['email'])) {
    //find if user exists
    const userID = findUser(req.body['email']);

    if( bcrypt.compareSync(req.body['password'], users[userID]['password']) ) {
      // password matches
      req.session.user_id = userID
      res.redirect('/');
    } else {
      // bad password for user
      console.log(bcrypt.compareSync(req.body['password'], users[userID]['password']) )
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
      password : bcrypt.hashSync(req.body['password'], 10)
    };
    req.session.user_id = userID
    res.redirect('urls');
  }

});


app.post("/logout", (req, res) => {
  req.session.user_id = 'session';
  res.redirect('/urls');
});



app.get("/urls/new", (req, res) => {
  if (!users[req.session["user_id"]]) {
   // not logged in
   res.redirect('/login')
  } else {
    let templateVars = {
      user: users[req.session["user_id"]],
    };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let shorty = generateRandomString();
  // id is short URL
  console.log(req.body)
  urlDatabase[shorty] = {
    id: req.session["user_id"],
    short: shorty,
    long: req.body['longURL']
  };
  //req.body returns object with longURL as key for url submitted
  res.redirect('/urls/'+shorty)
  // redirects to the page specific to the longURL given
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  if (!users[req.session["user_id"]]) {
    // not logged in
    res.status(403).send('You are not logged in');
    console.log('You aren\'t logged in!')
  } else if (users[req.session["user_id"]]['id'] !== urlDatabase[req.params.id]['id']) {
    // if the user id - as set by cookie dep on who is logged in - doesn't match url's user id
    res.status(403).send('You are not the proper user');
  } else {
    let templateVars = {
      user : users[req.session["user_id"]],
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id]['long']
    };
    res.render("urls_show", templateVars);
  }
});


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id]['long'] = req.body['longURL'];
  // update/changes longURL for specified shorty
  res.redirect('/urls');
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  res.redirect('/urls/'+req.params.id);
  //redirect to url/:id to implement update
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  let longURL = urlDatabase[req.params.shortURL]['long'];
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

function urlsForUser(idToFind) {
  // creates new object with short: long
  // for a specified user - known to exist
  const newObj = {} // all shorts and longs
  for(let short in urlDatabase) {
    if(urlDatabase[short]['id'] === idToFind) {
      newObj[urlDatabase[short]['short']] = urlDatabase[short]['long'];
    }
  }
  return newObj;
}
