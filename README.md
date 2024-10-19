# cMDb (Claudia's Movie Database)

This is the backend of 2 of these 2 Frontend Projects:

MovieDatabase - built with Angular: https://github.com/koernerclaudia/MovieDatabase-ANG
MovieDatabase - built with React: https://github.com/koernerclaudia/CMDB-Live

## Purpose

This is my version of a backend of a movie database; set up during my Full Stack Web Dev Training with [CareerFoundry](https://careerfoundry.com/en/courses/become-a-web-developer/). 
The project is built on the MERN Stack -> MongoDB, Express, React & Node.js.

The project is supposed to demonstrate full-stack JavaScript development, including APIs (REST), web server
frameworks, databases, business logic, authentication, data security, and more.

This project consists of 2 parts:

PART1 = Backend built with MongoDB, Express & Node.js.

PART2 = Frontend built with React / Angular 

## Built & Technologies

A backend was created with
- Web Server Environment: Node.js & Express
- Database: MongoDB
- Database Modelling (ODM): Mongoose
- Node Modules & Packages:
- Middleware
- Libraries

## Content & Functionalities

The Database consists of 2 collections:
- Movies
- Users

Users will be able to
- set up an account and get authenticated (username, password, email info will be necessary)
- Log in and out
- Change their user information
- Set up a list of favourite movies, add & delete movies from it
- De-register / Delete their account

The information about movies will include title, description, main actors, genre, genre info, director and year of birth of the director.

## API Information

WIP - https://cmdb-b8f3cd58963f.herokuapp.com/documentation.html

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


## API Documentation

Available on Swagger: https://cmdb-b8f3cd58963f.herokuapp.com/api-docs/


## Deployment

To check out this app

1) Fork the repository or download a Zip file form the main branch and extract.

2) Make sure you have Node and Express installed.

3) Run `npm install` to setup all other necessary dependencies. 

4) Run `node movies.js` to run the project - it should be hosted on http://localhost8080.

5) To check on the API endpoints and play around with it, use a service like Postman (https://www.postman.com/) Checkout the API documentation for all available endpoints. Endpoints are setup within the movies.js file.