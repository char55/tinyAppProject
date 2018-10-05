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
    password: bcrypt.hashSync("k", 10),
    visitorPass: generateRandomString()
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
    visitorPass: generateRandomString()
    // logged in user get identifier to track which shortURL they visit - those not logged in are tracked via cookies
  }

};

const urlDatabase = {
    'yoo8Pm' : {
      id: 'jo',
      short: 'yoo8Pm',
      long: "https://github.com/",
      date : "March 3 1998",
      countURL : 0,           // counts the number of times the short URL "/u/:id" has been clicked in total
      visitorTracker : [],    // tracks who has visited the URL short
      countUnique : 0         // counts the number of times the short URL "/u/:id" has been clicked by a single user
    },
    'b2xVn2' : {
      id: 'user2RandomID',
      short: 'b2xVn2',
      long: 'http://www.lighthouselabs.ca',
      date : "Friday the 13th",
      countURL : 0,
      visitorTracker : [],
      countUnique : 0
    },
    '9sm5xK' : {
      id: 'jo',
      short: '9sm5xK',
      long: "http://www.google.com",
      date : "01 01 2000",
      countURL : 0,
      visitorTracker : [],
      countUnique : 0
    }
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  if (users[req.session["user_id"]]) {
    // user is logged
    res.redirect('/urls')
  } else {
    res.redirect('/login')
  }
});

///////////////////////////////////////// functions

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


function userVisit(shortID, userID) {
    if(userID !== 'session') {
      // user is logged in but without cookie
      // give them their cookie
      visitor = users[userID]['visitorPass'];
      // now visitor has cookie - check if the website recognizes them
      checkVisit(shortID, visitor);

    } else {
      // no cookie?
      // not logged in
      // first time here!
      visitor = generateRandomString();
      users[userID]['visitorTracker'].push(visitor);
      urlDatabase[shortID]['countUnique'] = 1;
      // add them to the shorty's registry
    }
    return visitor // the req.session.visit cookieZ
};



function checkVisit(shortID, visitor) {
  let allVisitors = urlDatabase[shortID]['visitorTracker'];
  let found = allVisitors.findIndex(person => person === visitor);
  if (found < 0) {
  // if not - add a count
    urlDatabase[shortID]['visitorTracker'].push(visitor);
    urlDatabase[shortID]['countUnique']++
    return;
  } else {
  // if yes return
    return;
  }
}

/////////////////////////////////////////// coding for web pages

app.get("/login", (req, res) => {
  if(users[req.session["user_id"]]) {
    res.redirect('/urls')
  } else {
    res.render("login");
  }
});

app.post("/login", (req, res) => {


  if(findUser(req.body['email'])) {
    //find if user exists
    const userID = findUser(req.body['email']);

    if( bcrypt.compareSync(req.body['password'], users[userID]['password']) ) {
      // password matches
      // login!
      req.session.user_id = userID;

      if(req.session['visit'] !== null) {
      // if no visitor cookie - figure it out
        if (users[req.session['user_id']]['visitorPass'] !== req.session['visit']) {
          // if this is a different user on the same computer - reassign
          req.session.visit = users[req.session['id']];
        }
      }

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
// returns a page that includes a form with an email and password field.
  if(users[req.session["user_id"]]) {
    // if logged in
    res.redirect('/urls')
  } else {
  res.render("register")
  }
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();

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
      password : bcrypt.hashSync(req.body['password'], 10),
      visitorPass: generateRandomString()
    };
    req.session.user_id = userID;
    res.redirect('urls');
  }

});


app.post("/logout", (req, res) => {
  req.session.user_id = 'session';
  res.redirect('/urls');
});


app.get("/urls", (req, res) => {
  if (users[req.session["user_id"]]) {
    const objUser = urlsForUser(req.session['user_id']);
    let templateVars = {
      user: users[req.session['user_id']],
      data: objUser,
      dateBank: urlDatabase
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send('You are not logged in!  Access denied.');
  }
});

app.post("/urls", (req, res) => {
  if(req.session['user_id']) {
    let shorty = generateRandomString();
    // id is short URL
    urlDatabase[shorty] = {
      id: req.session["user_id"],
      short: shorty,
      long: req.body['longURL'],
      date: Date(),
      countURL : 0,
      visitorTracker : [],
      countUnique : 0
    };
    //req.body returns object with longURL as key for url submitted
    res.redirect('/urls/'+shorty)
    // redirects to the page specific to the longURL given
  } else {
    res.status(403).send('You are not logged in.  You must log in to use this fantastic service.')
  }
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


app.get("/urls/:id", (req, res) => {
  if (!users[req.session["user_id"]]) {
    // not logged in
    res.status(403).send('You are not logged in');
    console.log('You aren\'t logged in!')
  } else if (!urlDatabase[req.params.id]) {
      res.status(403).send('url short not found.  typo maybe? try again.')
  } else if (users[req.session["user_id"]]['id'] !== urlDatabase[req.params.id]['id']) {
      // if the user id - as set by cookie dep on who is logged in - doesn't match url's user id
      res.status(403).send('You are not the proper user for this shortURL');
  } else {
      let templateVars = {
        user : users[req.session["user_id"]],
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id]['long'],
        date: urlDatabase[req.params.id]['date']
      };

      if(req.session['visit'] === null) {
        // if no visitor cookie exists - assign one
        req.session.visit = userVisit(req.params.id, req.session['user_id']);
      }

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
  // link to shortURL
  if(urlDatabase[req.params.shortURL]) {
    let longURL = urlDatabase[req.params.shortURL]['long'];

    urlDatabase[req.params.shortURL]['countURL']++;
    if(req.session['visit'] === null) {
      // if no visitor cookie - figure it out
      req.session.visit = userVisit(req.params.shortURL, req.session['user_id']);
      urlDatabase[req.params.shortURL]['countUnique'] = 1;
    } else {
     checkVisit(req.params.shortURL, req.session['visit'])
    }

    res.redirect(longURL);
  } else {
    res.status(403).send('this short URL does not exist!')
  }
});
