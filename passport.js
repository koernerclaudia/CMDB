const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/**
 * Local authentication strategy using username and password.
 * Validates the user's credentials and authenticates them.
 * @name LocalStrategy
 * @function
 * @param {string} usernameField - The field representing the username in the request.
 * @param {string} passwordField - The field representing the password in the request.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    /**
     * Callback function for LocalStrategy to validate a user's credentials.
     * @param {string} username - The username entered by the user.
     * @param {string} password - The password entered by the user.
     * @param {function} callback - The callback function to handle the result.
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
 * JWT authentication strategy for handling token-based authentication.
 * Validates the JWT from the request and authenticates the user.
 * @name JWTStrategy
 * @function
 * @param {object} jwtPayload - The decoded payload from the JWT token.
 * @param {function} callback - The callback function to handle the result.
 */
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret',
    },
    /**
     * Callback function for JWTStrategy to validate a user's token.
     * @param {object} jwtPayload - The JWT payload containing user information.
     * @param {function} callback - The callback function to handle the result.
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
