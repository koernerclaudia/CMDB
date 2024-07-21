const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');

app.use(bodyParser.json());

let users = [
{
    id: 1,
    name: "Claudia",
    favMovies: [],
},
{
    id: 2,
    name: "Jana",
    favMovies: ["Interstellar"],

},


]

let movies = [
    {
      title: "Interstellar",
      director: {
        name: "Christopher Nolan",
        birth: "1970",
      },
      genre: {
        name: "Sci-Fi",
        description: "Science Fiction - stuff that cannot be real.",
    }
    },
    {
      title: "E.T.",
      director: {
        name: "Steven Spielberg",
        birth: "1946",
      },
      genre: {
        name: "Sci-Fi",
        description: "Science Fiction - stuff that cannot be real.",
    }
    },
    {
      title: "Kill Bill",
      director: {
        name: "Quentin Tarantino",
        birth: "1963",
      },
      genre: {
        name: "Thriller",
        description: "Gives you the chills.",
    }
    },
    {
      title: "Thor: Ragnarok",
      director: {
        name: "Taika Waititi",
        birth: "1975",
      },
      genre: {
        name: "Comic",
        description: "Superheros and stuff...",
    }
    },
    {
      title: "Crazy, Stupid, Love",
      director: {
        name: "Glenn Ficarra, John Requa",
        birth: "1969, 1967",
      },
      genre: {
        name: "RomCom",
        description: "Romantic and comedic.",
    }
    },
    {
      title: "The Crow",
      director: {
        name: "Alex Proyas",
        birth: "1963",
      },
      genre: {
        name: "Comic",
        description: "Superheros and stuff...",
    }
    },
    {
      title: "American History X",
      director: {
        name: "Tony Kaye",
        birth: "1952",
      },
      genre: {
        name: "Drama",
        description: "Tough stories.",
    }
    },
    {
      title: "Back to the Future",
      director: {
        name: "Robert Zemeckies",
        birth: "1952",
      },
      genre: {
        name: "Sci-Fi",
        description: "Science Fiction - stuff that cannot be real.",
    }
    },
    {
      title: "The Burbs",
      director: {
        name: "Joe Dante",
        birth: "1946",
      },
      genre: {
        name: "Thriller",
        description: "Gives you the chills.",
    }
    },
    {
      title: "Black Swan",
      director: {
        name: "Darren Aronofsky",
        birth: "1969",
      },
      genre: {
        name: "Thriller",
        description: "Gives you the chills.",
    }
    },

  ];

  // Endpoints user interaction
// Create - Allow new users to register
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    
    } else {
        res.status(400).send('users need names!')
    }
})

// Update - Allow users to update their username

app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user!')
    }

})

// Create (add new data) - Allow users to add movies to their favourites and post a message that this was done.

app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to the user ${id}'s array.`);
    } else {
        res.status(400).send('no such user!')
    }

})

// Delete - Allow users to remove a move from their list of favourites.

app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favMovies = user.favMovies.filter(title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from the user ${id}'s array.`);
    } else {
        res.status(400).send('no such user!')
    }

})

// Delete - Allow users to remove their information.

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`user ${id} has been deleted.`);
        
    } else {
        res.status(400).send('no such user!')
    }

})

// Endpoints for Movies
  // Read
app.get("/movies", (req, res) => {
    res.status(200).json(movies);
  })

  app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.title === title);

    if (movie) {
        res.status(200).json(movie);
        } else {
            res.status(400).send('no such movie!')
        }
  })

  app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.genre.name === genreName).genre;

    if (genre) {
        res.status(200).json(genre);
        } else {
            res.status(400).send('no such genre!')
        }
  })

  app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find( movie => movie.director.name === directorName).director;

    if (director) {
        res.status(200).json(director);
        } else {
            res.status(400).send('no such director!')
        }
  })


  // Requests for the page.

//  GET requests

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send("Welcome to CMDB - Claudia's Movie DataBase!!");
});

app.get('/movies', (req, res) => {
  res.send('Successful GET request returning data on all the movies.');
});

  // Example route that triggers an error
  app.get('/books', (req, res) => {
    throw new Error('This is an intentional error.');
  });
  
    app.get('/secreturl', (req, res) => {
      res.send('This is a secret url with super top-secret content.');
    });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Whoops, something is not right here!');
});


    // listen for requests
    app.listen(8088, () => {
        console.log('Your app is listening on port 8088.');
      });  


