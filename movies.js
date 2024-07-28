const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cmdb', {
  serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 30000, // Give up initial connection after 30 seconds
  bufferCommands: false, // Disable Mongoose buffering
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');

app.use(bodyParser.json());

// USER BASED ACTIONS

//Add a user

app.post('/users', async (req, res) => {
  await Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send('Someone with the Username "' + req.body.username + '" already exists.');
      } else {
        Users
          .create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            Birthdate: req.body.Birthdate
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Get all users
app.get('/users', async (req, res) => {
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
app.get('/users/:username', async (req, res) => {
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

// Update a user's info, by username

app.put('/users/:username', async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, { $set:
    {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      Birthdate: req.body.Birthdate
    }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })

});

// Add a movie to a user's list of favorites
// Useing addtoSet so it is only added once. In case already added,
// there will not be a message.
app.post('/users/:username/movies/:MovieID', async (req, res) => {
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
app.delete('/users/:username/movies/:MovieID', async (req, res) => {
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
app.delete('/users/:username', async (req, res) => {
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

app.get('/movies', async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

 // Get a specific movie by title and list all its information

app.get('/movies/:Title', async (req, res) => {
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

app.get('/movies/genres/:genreType', async (req, res) => {
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

app.get('/movies/directors/:directorName', async (req, res) => {
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
    app.listen(8088, () => {
        console.log('Your app is listening on port 8088.');
      });  


