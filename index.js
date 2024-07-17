const express = require('express'), morgan = require('morgan');
const app = express();

let topMovies = [
    {
      title: 'Interstellar',
      director: 'Christopher Nolan'
    },
    {
      title: 'E.T.',
      director: 'Steven Spielberg'
    },
    {
      title: 'Kill Bill',
      author: 'Quentin Tarantino'
    }
  ];

  app.use(morgan('common'));

  // GET requests
app.get('/', (req, res) => {
  res.send("Welcome to CMDB - Claudia's Movie DataBase!");
});
  
  app.use(express.static('public'));
  
  app.get('/movies', (req, res) => {
    res.json(topMovies);
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
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });  