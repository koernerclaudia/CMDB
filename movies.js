const mongoose = require('mongoose')
require('dotenv').config()
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

// Connection through Heroku
// mongoose.connect(process.env.CONNECTION_URI);

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
      description:
        "This is a simple REST API application made with Express & MongoDB. Check out the app [here](https://cmdb2024.netlify.app).",
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

const swaggerSpec = swaggerJsdoc(options)
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
let allowedOrigins = ['http://localhost:8088', 'http://testsite.com','http://localhost:8088', 'https://cmdb2024.netlify.app', 'http://localhost:4000'];

// Allow access from all origins.
app.use(cors());

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');



// USER BASED ACTIONS

//Add a user
app.post('/users',
  [
    check('username', 'Username is required').isLength({min: 5}).withMessage('Username must be at least 5 characters long.'),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric().withMessage('Username must contain letters and numbers.'),
    check('password', 'Password is required').not().isEmpty(),
    check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    check('email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    await Users.findOne({ username: req.body.username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.username + ' already exists');
        } else {
          Users
            .create({
              username: req.body.username,
              password: hashedPassword,
              email: req.body.email,
              Birthdate: req.body.Birthdate
            })
            .then((user) => { res.status(201).json(user) })
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



// Get all users
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

// Get a user by username
app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.params.username });

    // Check if the user is not found
    if (!user) {
      return res.status(404).send('Error: No one here with that Username.');
    }

    // If user is found, send the user data as JSON
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// Update a user's info, by username (updating username and/or password and/or email)

app.put('/users/:username', passport.authenticate('jwt', {session: false}), 
[
  check('username').optional().isLength({ min: 5 }).withMessage('Username must be at least 5 characters long'),
  check('username', 'Username contains non alphanumeric characters - not allowed.').optional().isAlphanumeric().withMessage('Username must contain letters and numbers.'),
    check('password', 'Password must be at least 8 characters long').optional().isLength({ min: 8 }),
    check('email', 'Email does not appear to be valid').optional().isEmail()
],
async (req, res) => {
  // check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  // CONDITION TO CHECK ADDED HERE
  if(req.user.username !==req.params.username){
    return res.status(400).send('Permission denied');
  }

  let updateData = {};

  // Only include fields that are present in the request body
  if (req.body.username) updateData.username = req.body.username;
  if (req.body.password) updateData.password = Users.hashPassword(req.body.password);
  if (req.body.email) updateData.email = req.body.email;

  // If no fields to update, return an error
  if (Object.keys(updateData).length === 0) {
    return res.status(400).send('No fields to update');
  }
  
  await Users.findOneAndUpdate(
    { username: req.params.username }, 
    { $set: updateData },
    { new: true }
  
  ) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: '  + err);
  })

});



// Add a movie to a user's list of favorites
// Useing addtoSet so it is only added once. In case already added,
// there will not be a message.
app.post('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, {
     $addToSet: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Delete a movie from a user's list of favorites
app.delete('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Delete a user by username
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

  // ACTIONS WITH MOVIE DATABASE

  // Return a list of ALL movies to the user

  app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const genreType = req.query.genre; // Retrieve the genre from query parameters
    const actorName = req.query.actor; // Retrieve the actor from query parameters
    
    try {
      let query = {};
  
      // Check if the genre exists in any movie's Genre.Type
      if (genreType) {
        const genreExists = await Movies.exists({ 'Genre.Type': genreType });
  
        if (!genreExists) {
          return res.status(404).send(`Error: The genre "${genreType}" was not found. Please check the spelling and try again. The genre might also not be part of this database.`);
        }
  
        query['Genre.Type'] = genreType;
      }
  
      // Check if the actor exists in any movie's Actors array
      if (actorName) {
        const actorExists = await Movies.exists({ 'Actors': actorName });
  
        if (!actorExists) {
          return res.status(404).send(`Error: The actor "${actorName}" was not found. Please check the spelling and try again. If the name is indeed correct, they might not actually appear as main actor in the movies listed in this database.`);
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
  
  
  

 // Get a specific movie by title and list all its information

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.Title });

    // Check if the movie is found
    if (!movie) {
      return res.status(404).send('Error: This movie is not listed. Check again.');
    }

    // If movie is found, send the user data as JSON
    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// Return data about a genre and its information

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

// Return data about a director and their information

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

    // listen for requests
    const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});


