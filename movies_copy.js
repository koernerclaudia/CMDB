/**
 * Required dependencies and configurations.
 */
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

// Import necessary modules for validation and Express
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
      description: "This is a simple REST API application made with Express & MongoDB.",
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
let allowedOrigins = ['http://localhost:8088', 'http://testsite.com', 'https://cmdb2024.netlify.app', 'http://localhost:4000'];

app.use(cors());

let auth = require('./auth.js')(app);

const passport = require('passport');
require('./passport.js');

/**
 * @module UserRoutes
 * User-based API endpoints.
 */

/**
 * @function CreateUser
 * @description Add a new user.
 * @route POST /users
 */
app.post('/users', [
  check('username', 'Username is required').isLength({ min: 5 }),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').not().isEmpty(),
  check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
  check('email', 'Email does not appear to be valid').isEmail()
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
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/**
 * @function GetUsers
 * @description Get a list of all users.
 * @route GET /users
 */
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @function GetUserByUsername
 * @description Get a user by username.
 * @route GET /users/:username
 */
app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).send('Error: No one here with that Username.');
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

/**
 * @function UpdateUser
 * @description Update a user's info by username.
 * @route PUT /users/:username
 */
app.put('/users/:username', passport.authenticate('jwt', { session: false }), [
  check('username').optional().isLength({ min: 5 }),
  check('username', 'Username contains non alphanumeric characters - not allowed.').optional().isAlphanumeric(),
  check('password', 'Password must be at least 8 characters long').optional().isLength({ min: 8 }),
  check('email', 'Email does not appear to be valid').optional().isEmail()
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

  await Users.findOneAndUpdate(
    { username: req.params.username }, 
    { $set: updateData },
    { new: true }
  )
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @function AddFavoriteMovie
 * @description Add a movie to a user's list of favorites.
 * @route POST /users/:username/movies/:MovieID
 */
app.post('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, {
    $addToSet: { FavoriteMovies: req.params.MovieID }
  },
  { new: true })
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @function RemoveFavoriteMovie
 * @description Remove a movie from a user's list of favorites.
 * @route DELETE /users/:username/movies/:MovieID
 */
app.delete('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
  { new: true })
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @function DeleteUser
 * @description Delete a user by username.
 * @route DELETE /users/:username
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
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @module MovieRoutes
 * Movie-based API endpoints.
 */

/**
 * @function GetMovies
 * @description Return a list of all movies, with optional filtering by genre or actor.
 * @route GET /movies
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
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

/**
 * @function GetMovieByTitle
 * @description Get a specific movie by title and list its information.
 * @route GET /movies/:Title
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.Title });
    if (!movie) {
      return res.status(404).send('Error: This movie is not listed.');
    }
    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

/**
 * @function GetGenre
 * @description Return data about a genre and its information.
 * @route GET /movies/genres/:genreType
 */
app.get('/movies/genres/:genreType', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const genreType = req.params.genreType;
    const movie = await Movies.findOne({ 'Genre.Type': genreType });
    if (movie) {
      res.status(200).json(movie.Genre);
    } else {
      res.status(404).send('No such genre');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

/**
 * @function GetDirector
 * @description Return data about a director and their information.
 * @route GET /movies/directors/:directorName
 */
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const directorName = req.params.directorName;
    const movie = await Movies.findOne({ 'Director.Name': directorName });
    if (movie) {
      res.status(200).json(movie.Director);
    } else {
      res.status(404).send('No such director');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

app.use(express.static('public'));

/**
 * @function Listen
 * @description Start the Express server and listen for requests.
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
