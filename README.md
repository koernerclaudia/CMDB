# cMDb (Claudia's Movie Database)

(this project and this readme file are still WIP)

### Status: 2 August 2024

- The API is now hosted on Heroku and the database is at Mongo Atlas.
- Authentication & Authorisation practises has been added via Express / Node packages. (auth.js, passport.js were added)

### Status: 27 July 2024

- I have just done the data modelling via the Mongoose Model file and set up a few endpoints and tested those in Postman.
- Users will be able to change their profile and collect a list of favourite movies.



## What is this?: 

This is my version of a movie database set up during my Web Dev Training with CareerFoundry. The task was to build 

- a backend with MongoDB, Mongoose, Node.JS and Express comprising of a database of 2 collections:
    - movies
    - users
    and an API requesting different endpoints within those collections.
- Users are supposed to be able to:
    - register (username, password, email - required; birthdate - optional)
    - change their user data 
    - add movies to their list of favourites
    - de-register / delete their account
- Movie information comprises of:
    - title, description, genre & details, director & details
- WIP: a frontend using React
- (-> MERN Stack)

