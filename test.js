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
};


// create object for all shorts with same id

const id_to_find = 'jo';
const newObj = {} // all shorts and longs
for(let short in urlDatabase) {
  if(urlDatabase[short]['id'] === id_to_find) {
    newObj[urlDatabase[short]['short']] = urlDatabase[short]['long'];
  }
}

console.log(newObj)