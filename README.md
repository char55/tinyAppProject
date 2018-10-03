If someone is not logged in when trying to access /urls/new, redirect them to the login page.


Similarly, this also means that the /urls/:id page should display a message or prompt if the user is not logged in, or if the the URL with the matching :id does not belong to them.

Since these short URLs are meant to be shared with anyone, make sure that anyone can still visit the short URLs and get properly redirected, whether they are logged in or not.

    id: "jo",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },