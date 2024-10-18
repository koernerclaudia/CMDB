/**
 * This module sets up a server for a movie database API using Express.js and MongoDB.
 * It includes user management, movie information, and CORS settings.
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

/**
 * Connects to the MongoDB database using the connection URI from environment variables.
 */
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const { check, validationResult } = require('express-validator');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Swagger configuration options for API documentation.
 */
const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Movie Database - Rest API',
      version: '0.1.0',
      description:
        'This is a simple REST API application made with Express & MongoDB. Check out the app [here](https://cmdb2024.netlify.app).',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080/',
      },
    ],
  },
  apis: ['./swagger.yaml'],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Serves the Swagger API documentation at the /api-docs endpoint.
 */
app.use(
  '/api-docs',
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
  'https://cmdb-ang.netlify.app',
];

/**
 * Sets up CORS (Cross-Origin Resource Sharing) to allow requests from specific origins.
 */
app.use(
  cors({
    origin: 'http://your-angular-app-url.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

/**
 * Endpoint to add a new user.
 * 
 * @param {string} username - User's username.
 * @param {string} password - User's password.
 * @param {string} email - User's email.
 * @param {Date} [Birthdate] - User's birthdate.
 * @returns {object} - The created user object.
 */
app.post(
  '/users',
  [
    check('username', 'Username is required').isLength({ min: 5 }),
    check('username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    check('email', 'Email does not appear to be valid').isEmail(),
  ],
  async (req, res) => {
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
            Birthdate: req.body.Birthdate,
          })
            .then((user) => {
              res.status(201).json(user);
            })
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
  }
);

/**
 * Endpoint to get all users.
 * 
 * @returns {Array} - List of all users.
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
 * Endpoint to get a user by username.
 * 
 * @param {string} username - User's username.
 * @returns {object} - The user object.
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
 * Endpoint to update a user's information by username.
 * 
 * @param {string} username - The user's username to update.
 * @param {string} [password] - New password.
 * @param {string} [email] - New email.
 * @returns {object} - The updated user object.
 */
app.put(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  [
    check('username').optional().isLength({ min: 5 }),
    check('username', 'Username contains non-alphanumeric characters - not allowed.').optional().isAlphanumeric(),
    check('password', 'Password must be at least 8 characters long').optional().isLength({ min: 8 }),
    check('email', 'Email does not appear to be valid').optional().isEmail(),
  ],
  async (req, res) => {
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
  }
);

/**
 * Endpoint to add a movie to a user's list of favorites.
 * 
 * @param {string} username - User's username.
 * @param {string} MovieID - The ID of the movie to add to favorites.
 * @returns {object} - The updated user object with the favorite movie added.
 */
app.post('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate(
    { username: req.params.username },
    { $addToSet: { FavoriteMovies: req.params.MovieID } },
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
 * Endpoint to delete a movie from a user's list of favorites.
 * 
 * @param {string} username - User's username.
 * @param {string} MovieID - The ID of the movie to remove from favorites.
 * @returns {object} - The updated user object with the favorite movie removed.
 */
app.delete('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate(
    { username: req.params.username },
    { $pull: { FavoriteMovies: req.params.MovieID } },
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
 * Endpoint to delete a user by username.
 * 
 * @param {string} username - User's username.
 * @returns {string} - Success or failure message.
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

// Additional endpoints for movie actions...

/**
 * Serves static files from the 'public' directory.
 */
app.use(express.static('public'));

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
