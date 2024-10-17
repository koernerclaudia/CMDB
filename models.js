


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * @typedef {Object} Genre
 * @property {string} Type - The genre type of the movie.
 * @property {string} Description - A description of the genre.
 */

/**
 * @typedef {Object} Director
 * @property {string} Name - The name of the director.
 * @property {string} Birthyear - The birth year of the director.
 */

/**
 * @typedef {Object} Movie
 * @property {string} Title - The title of the movie.
 * @property {string} Description - A brief description of the movie.
 * @property {Genre} Genre - The genre information of the movie.
 * @property {Director} Director - The director information of the movie.
 * @property {string[]} Actors - An array of actor names in the movie.
 * @property {string} ImagePath - The path to the movie's image.
 * @property {boolean} Featured - Indicates if the movie is featured.
 */

/**
 * @typedef {Object} User
 * @property {string} username - The username of the user.
 * @property {string} password - The hashed password of the user.
 * @property {string} email - The email of the user.
 * @property {Date} Birthdate - The birth date of the user.
 * @property {ObjectId[]} FavoriteMovies - An array of ObjectIds referencing the user's favorite movies.
 */

/**
 * @type {mongoose.Schema<Movie>}
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
 * @type {mongoose.Schema<User>}
 */
let userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    Birthdate: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {string} - The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

/**
 * Validates a password against the hashed password in the user document.
 * @param {string} password - The password to validate.
 * @returns {boolean} - Returns true if the password is valid, false otherwise.
 */
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

/**
 * @type {mongoose.Model<Movie>}
 */
let Movie = mongoose.model('Movie', movieSchema);

/**
 * @type {mongoose.Model<User>}
 */
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
