/**
 * This module sets up authentication strategies using Passport.js.
 * It includes a local strategy for handling username/password authentication
 * and a JWT strategy for handling token-based authentication.
 */

const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/**
 * Configures the local authentication strategy using Passport.js.
 * 
 * This strategy is used to authenticate users based on their username and password.
 * 
 * @param {string} usernameField - The field in the request representing the username.
 * @param {string} passwordField - The field in the request representing the password.
 * @param {Function} callback - The callback function to execute after authentication.
 * @returns {void}
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    /**
     * Verifies the user's credentials.
     * 
     * @param {string} username - The username provided by the user.
     * @param {string} password - The password provided by the user.
     * @param {Function} callback - A callback to execute upon completion of authentication.
     * @returns {void}
     */
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      await Users.findOne({ username: username })
        .then((user) => {
          if (!user) {
            console.log('incorrect username');
            return callback(null, false, {
              message: 'Incorrect username or password.',
            });
          }
          if (!user.validatePassword(password)) {
            console.log('incorrect password');
            return callback(null, false, { message: 'Incorrect password.' });
          }
          console.log('finished');
          return callback(null, user);
        })
        .catch((error) => {
          if (error) {
            console.log(error);
            return callback(error);
          }
        });
    }
  )
);

/**
 * Configures the JWT authentication strategy using Passport.js.
 * 
 * This strategy is used to authenticate users based on a JSON Web Token (JWT).
 * 
 * @param {Function} jwtFromRequest - Function to extract the JWT from the request.
 * @param {string} secretOrKey - The secret key used to verify the token's signature.
 * @param {Function} callback - The callback function to execute after authentication.
 * @returns {void}
 */
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret',
    },
    /**
     * Verifies the JWT token and retrieves the associated user.
     * 
     * @param {Object} jwtPayload - The decoded JWT payload containing user information.
     * @param {Function} callback - A callback to execute upon completion of token verification.
     * @returns {void}
     */
    async (jwtPayload, callback) => {
      return await Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
