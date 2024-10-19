const mongoose = require('mongoose');
require('dotenv').config();
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

const dbURI = process.env.CONNECTION_URI;

if (!dbURI) {
  throw new Error('MongoDB URI is not defined');
}

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const { check, validationResult } = require('express-validator');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Movie Database - Rest API",
      version: "0.1.0",
      description: "This is a simple REST API application made with Express & MongoDB. Check out the app [here](https://cmdb2024.netlify.app).",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
    },
    servers: [
      {
        url: "http://localhost:8080/",
      },
    ],
  },
  apis: ["./swagger.yaml"],
};

const swaggerSpec = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = [
  'http://localhost:8088', 
  'http://testsite.com',
  'https://cmdb2024.netlify.app',
  'http://localhost:4000',
  'https://cmdb-ang.netlify.app'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

/**
 * Adds a new user to the database.
 * @name POST/users
 * @function
 * @memberof module:routes/users
 * @param {string} username - The new user's username.
 * @param {string} password - The new user's password.
 * @param {string} email - The new user's email address.
 * @param {Date} Birthdate - The new user's birthdate.
 */
app.post('/users', [
  check('username').isLength({ min: 5 }).withMessage('Username must be at least 5 characters long.'),
  check('username').isAlphanumeric().withMessage('Username must contain letters and numbers.'),
  check('password').not().isEmpty(),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  check('email').isEmail()
], async (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.password);
  await Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + ' already exists');
      } else {
        Users.create({
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          Birthdate: req.body.Birthdate
        })
          .then((user) => { res.status(201).json(user); })
          .catch((error) => { res.status(500).send('Error: ' + error); });
      }
    })
    .catch((error) => { res.status(500).send('Error: ' + error); });
});

/**
 * Gets all users from the database.
 * @name GET/users
 * @function
 * @memberof module:routes/users
 */
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => { res.status(201).json(users); })
    .catch((err) => { res.status(500).send('Error: ' + err); });
});

/**
 * Gets a specific user by username.
 * @name GET/users/:username
 * @function
 * @memberof module:routes/users
 */
app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).send('Error: No one here with that Username.');
    }

    res.json(user);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

/**
 * Updates a user's information by username.
 * @name PUT/users/:username
 * @function
 * @memberof module:routes/users
 */
app.put('/users/:username', passport.authenticate('jwt', { session: false }), [
  check('username').optional().isLength({ min: 5 }).withMessage('Username must be at least 5 characters long'),
  check('username').optional().isAlphanumeric().withMessage('Username must contain letters and numbers.'),
  check('password').optional().isLength({ min: 8 }),
  check('email').optional().isEmail()
], async (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  if (req.user.username !== req.params.username) {
    return res.status(400).send('Permission denied');
  }

  let updateData = {};
  if (req.body.username) updateData.username = req.body.username;
  if (req.body.password) updateData.password = Users.hashPassword(req.body.password);
  if (req.body.email) updateData.email = req.body.email;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).send('No fields to update');
  }

  await Users.findOneAndUpdate({ username: req.params.username }, { $set: updateData }, { new: true })
    .then((updatedUser) => { res.json(updatedUser); })
    .catch((err) => { res.status(500).send('Error: ' + err); });
});

/**
 * Adds a movie to a user's list of favorites.
 * @name POST/users/:username/movies/:MovieID
 * @function
 * @memberof module:routes/users
 */
app.post('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, { $addToSet: { FavoriteMovies: req.params.MovieID } }, { new: true })
    .then((updatedUser) => { res.json(updatedUser); })
    .catch((err) => { res.status(500).send('Error: ' + err); });
});

/**
 * Removes a movie from a user's list of favorites.
 * @name DELETE/users/:username/movies/:MovieID
 * @function
 * @memberof module:routes/users
 */
app.delete('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, { $pull: { FavoriteMovies: req.params.MovieID } }, { new: true })
    .then((updatedUser) => { res.json(updatedUser); })
    .catch((err) => { res.status(500).send('Error: ' + err); });
});

/**
 * Deletes a user by username.
 * @name DELETE/users/:username
 * @function
 * @memberof module:routes/users
 */
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndDelete({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send('The User "' + req.params.username + '" could not be found.');
      } else {
        res.status(200).send('The User "' + req.params.username + '" has been deleted.');
      }
    })
    .catch((err) => { res.status(500).send('Error: ' + err); });
});

/**
 * Gets a list of all movies in the database, with optional filtering by genre and actor.
 * @name GET/movies
 * @function
 * @memberof module:routes/movies
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const genreType = req.query.genre;
  const actorName = req.query.actor;

  try {
    let query = {};

    if (genreType) {
      const genreExists = await Movies.exists({ 'Genre.Type': genreType });
      if (!genreExists) {
        return res.status(404).send(`Error: The genre "${genreType}" was not found.`);
      }
      query['Genre.Type'] = genreType;
    }

    if (actorName) {
      const actorExists = await Movies.exists({ 'Actors': actorName });
      if (!actorExists) {
        return res.status(404).send(`Error: The actor "${actorName}" was not found.`);
      }
      query['Actors'] = actorName;
    }

    const movies = await Movies.find(query);
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

/**
 * Gets information about a specific movie by title.
 * @name GET/movies/:Title
 * @function
 * @memberof module:routes/movies
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.Title });
    if (!movie) {
      return res.status(404).send('Error: This movie is not listed. Check again.');
    }
    res.json(movie);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

/**
 * Gets information about a genre.
 * @name GET/movies/genres/:genreType
 * @function
 * @memberof module:routes/movies
 */
app.get('/movies/genres/:genreType', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movie = await Movies.findOne({ 'Genre.Type': req.params.genreType });
    if (movie) {
      res.status(200).json(movie.Genre);
    } else {
      res.status(404).send('No such genre');
    }
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

/**
 * Gets information about a director.
 * @name GET/movies/directors/:directorName
 * @function
 * @memberof module:routes/movies
 */
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movie = await Movies.findOne({ 'Director.Name': req.params.directorName });
    if (movie) {
      res.status(200).json(movie.Director);
    } else {
      res.status(404).send('No such director');
    }
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

app.use(express.static('public'));

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
