/**
 * Secret key for signing JWT tokens.
 * It should match the key used in the JWTStrategy.
 * @constant {string}
 */
const jwtSecret = 'your_jwt_secret'; 

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); 
// Local passport file to set up authentication strategies

/**
 * Generates a JWT token for the provided user object.
 * 
 * @function
 * @param {Object} user - The user object for which the JWT is generated.
 * @param {string} user.username - The username of the user.
 * @returns {string} - A signed JWT token that expires in 7 days.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // Encodes the username in the JWT
    expiresIn: '7d', // Token expires in 7 days
    algorithm: 'HS256' // Algorithm used to sign the JWT
  });
}

/**
 * Sets up the /login route and handles user login requests.
 * Uses Passport.js for local authentication and returns a JWT token upon successful login.
 * 
 * @module LoginRoute
 * @param {Object} router - The Express router object to define the route.
 */
module.exports = (router) => {
  /**
   * POST /login route handler.
   * Authenticates the user using Passport.js and issues a JWT token if authentication is successful.
   * 
   * @name POST/login
   * @function
   * @memberof module:LoginRoute
   * @param {Object} req - The request object containing user login details.
   * @param {Object} res - The response object to send the result.
   * @returns {JSON} - A JSON object containing the user details and JWT token if successful.
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

      req.login(user, { session: false }, (error) => {
        if (error) {
          console.error('Error in req.login:', error);
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        console.log('JWT token generated for user:', user.username);
        return res.json({ user, token });
      });
    })(req, res);
  });
}
