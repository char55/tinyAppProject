# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

![Login Page](https://github.com/char55/tinyAppProject/blob/master/docs/Login_Page.png?raw=true)
![Index of URLs shortened by specified user](https://github.com/char55/tinyAppProject/blob/master/docs/User's_URL_index.png?raw=true)
![Each shortened URL can be updated](https://github.com/char55/tinyAppProject/blob/master/docs/Updating_URL.png?raw=true)

## Dependencies

-Node.js
-Express
-EJS
-yarn
-bcrypt
-body-parser
-cookie-parser
-cookie-session

## Getting Started

- Install all dependencies (use 'npm install' command - note: you will need to install 'bcrypt' using yarn ('yarn add bcrypt'))
- Run the development web server using the 'node express_server.js command.
- Web application should now be available at:
         http://localhost:8080/

## Website abilities

- Registered users are capable of:
      * Creating shortened URLs for any website
      * Storing these codes and their corresponding URLs in their account
      * Any shortened URL can be shared with any user (registered or not)
      * Codes are otherwise kept private; ie: users can only see the codes they created within their index
      * Codes and URLs can be deleted
      * The URL for a specified code can be edited/updated
      * Users can log out at any time
- The date at which a URL was shortened is recorded
- The number of times each shortened URL is visited is recorded
- The number of times each shortened URL is uniquely visited is recorded
            -a single user is recorded as visiting a single time - regardless of the amount of times they visited the site