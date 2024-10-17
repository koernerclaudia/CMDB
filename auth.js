const jwtSecret = 'your_jwt_secret'; 
// This must be the same key used in the JWTStrategy for signing JWT tokens

const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport'); 
// Your local passport configuration file

/**
 * Generates a JWT token for an authenticated user.
 * 
 * @param {Object} user - The user object for which to generate a token.
 * @returns {string} - The generated JWT token.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // Username being encoded in the JWT
    expiresIn: '7d', // Token expiration time (7 days)
    algorithm: 'HS256' // Algorithm used for signing the JWT
  });
}

/**
 * POST login endpoint to authenticate a user and generate a JWT token.
 * 
 * @param {Object} router - Express router object to handle the login route.
 */
module.exports = (router) => {
  /**
   * Login route: Authenticates user using passport and generates a JWT token.
   * 
   * @route POST /login
   * @param {string} username - The username of the user attempting to log in.
   * @param {string} password - The password of the user.
   * @returns {Object} - An object containing the authenticated user and the JWT token.
   */
  router.post('/login', (req, res) => {
    console.log('Login request received with body:', req.body);

    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        console.log('Authentication failed:', error || info.message);
        return res.status(400).json({
          message: 'Something is not right here.',
          user: user
        });
      }

      console.log('User authenticated successfully:', user.username);

      // Logs in the authenticated user and generates a JWT token
      req.login(user, { session: false }, (error) => {
        if (error) {
          console.error('Error in req.login:', error);
          return res.send(error);
        }

        let token = generateJWTToken(user.toJSON());
        console.log('JWT token generated for user:', user.username);

        return res.json({ user, token }); // Return the user and the JWT token
      });
    })(req, res);
  });
}
