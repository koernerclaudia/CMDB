const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Schema for Movie documents in MongoDB.
 * @typedef {Object} MovieSchema
 * @property {string} Title - The title of the movie.
 * @property {string} Description - A description of the movie.
 * @property {Object} Genre - The genre of the movie.
 * @property {string} Genre.Type - The type or name of the genre.
 * @property {string} Genre.Description - A description of the genre.
 * @property {Object} Director - The director of the movie.
 * @property {string} Director.Name - The director's name.
 * @property {string} Director.Birthyear - The birth year of the director.
 * @property {string[]} Actors - An array of actors featured in the movie.
 * @property {string} ImagePath - A URL or path to the movie's image.
 * @property {boolean} Featured - Whether the movie is featured or not.
 */
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Type: String,
    Description: String
  },
  Director: {
    Name: String,
    Birthyear: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

/**
 * Schema for User documents in MongoDB.
 * @typedef {Object} UserSchema
 * @property {string} username - The user's username.
 * @property {string} password - The user's hashed password.
 * @property {string} email - The user's email address.
 * @property {Date} Birthdate - The user's birthdate.
 * @property {ObjectId[]} FavoriteMovies - An array of ObjectId references to favorite movies.
 */
let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  Birthdate: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * Hashes a plain-text password using bcrypt.
 * 
 * @function
 * @name hashPassword
 * @memberof UserSchema
 * @static
 * @param {string} password - The plain-text password to hash.
 * @returns {string} - The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Validates a plain-text password against the hashed password stored in the database.
 * 
 * @function
 * @name validatePassword
 * @memberof UserSchema
 * @instance
 * @param {string} password - The plain-text password to validate.
 * @returns {boolean} - Returns true if the password matches the hashed password, otherwise false.
 */
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

/**
 * Mongoose model for Movie documents.
 * @typedef {Model} Movie
 */
let Movie = mongoose.model('Movie', movieSchema);

/**
 * Mongoose model for User documents.
 * @typedef {Model} User
 */
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
