# cMDb (Claudia's Movie Database)



## Purpose

This is my version of a backend of a movie database; set up during my Full Stack Web Dev Training with CareerFoundry. 
The project is built on the MERN Stack -> MongoDB, Express, React & Node.js.
The frontend will be built with React in a different project / repository. Check it out here:

## Built & Technologies

A backend was created with
- Web Server Environment: Node.js & Express
- Database: MongoDB
- Database Modelling (ODM): & Mongoose
- Node Modules & Packages:
    - ...
- Middleware
- Libraries

## Content & Functionalities

The Database currently consists of 2 collections:
- Movies
- Users

Users will be able to
- set up an account and get authenticated (username, password, email info will be necessary)
- Log in and out
- Change their user information
- Set up a list of favourite movies
- Add and delete movies from their list of favourites
- De-register / Delete their account

The information about movies will include title, description, main actors, genre, genre info, director and year of birth of the director.

## API Information

The following endpoints can be queried:



## Authentication & Authorisation
- JWT-based security measures are in use. Token-based access
- Data validation
- Authentication middleware
- Password hashing (Bcrypt)
- Cors: Cross-Origin Resource Sharing middleware.

## Tools used:

- VS Code for Code Editing
- Terminal / CLI
- MongoDB Compass
- Heroku: to host the API
- MongoDB Atlas: to host the Database
- Github: To host the project & repository
- Postman: To test API Endpoints
- (WIP: Swagger for API Documentation)

## Functionality & Features



### Status: 2 August 2024

- The API is now hosted on Heroku and the database is at Mongo Atlas.
- Authentication & Authorisation practises has been added via Express / Node packages. (auth.js, passport.js were added)

### Status: 27 July 2024

- I have just done the data modelling via the Mongoose Model file and set up a few endpoints and tested those in Postman.
- Users will be able to change their profile and collect a list of favourite movies.







## Status of the API

Although all files here are public, the API itself is not available for use.










Features
Movies API: Access movie details.
User Management: Manage users and their favorite movies.
Authentication: JWT-based security.
Swagger Documentation: Interactive API docs.
Data Validation: Ensures data integrity.
Technologies
Passport.js: Authentication middleware.
Swagger: API documentation tool.
Cors: Cross-Origin Resource Sharing middleware.
Bcrypt: Password hashing.
View Live
https://movie-api-4o5a.onrender.com/

API Endpoints
Movies


Get all users: GET /users
Create a user: POST /users
Update a user: PUT /users/:username
Delete a user: DELETE /users/:username
Add movie to favorites: POST /users/:username/movies/:MovieID
Remove movie from favorites: DELETE /users/:username/movies/:MovieID
Usage
Explore the API at http://localhost:8080/docs once the server is running.

License
MIT License - see the LICENSE file for details.